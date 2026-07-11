import { supabase, isSupabaseConfigured } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
}

const SIGNED_URL_EXPIRY = 3600; // 1 hour

/**
 * Upload an audio file to private storage.
 * Returns a short-lived signed URL for immediate playback after upload.
 */
export const uploadAudioFile = async (file: File, artistId: string): Promise<UploadResult> => {
  try {
    if (!isSupabaseConfigured) {
      const blobUrl = URL.createObjectURL(file);
      return { url: blobUrl, path: `demo/${artistId}/${file.name}` };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${artistId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    // Return a signed URL — bucket is now private, public URLs won't work
    const { data: signed, error: signErr } = await supabase.storage
      .from('audio-files')
      .createSignedUrl(data.path, SIGNED_URL_EXPIRY);

    if (signErr || !signed) throw signErr ?? new Error('Failed to generate signed URL');

    return { url: signed.signedUrl, path: data.path };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload audio file');
  }
};

export const deleteAudioFile = async (path: string): Promise<void> => {
  try {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.storage.from('audio-files').remove([path]);
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete audio file');
  }
};

/**
 * Get a short-lived signed URL for an audio file path.
 * The bucket is private — direct public URLs are no longer valid.
 */
export const getAudioFileUrl = async (path: string): Promise<string> => {
  if (!isSupabaseConfigured) {
    return `https://example.com/demo-audio/${path}`;
  }

  const { data, error } = await supabase.storage
    .from('audio-files')
    .createSignedUrl(path, SIGNED_URL_EXPIRY);

  if (error || !data) {
    console.error('Error generating signed URL:', error);
    return '';
  }

  return data.signedUrl;
};

export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 50 * 1024 * 1024;
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/flac', 'audio/aac'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 50MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Supported formats: MP3, WAV, MP4, FLAC, AAC' };
  }

  return { valid: true };
};
