import { supabase, isSupabaseConfigured } from './supabase';

export interface UploadResult {
  url: string;
  path: string;
}

export const uploadAudioFile = async (file: File, artistId: string): Promise<UploadResult> => {
  try {
    if (!isSupabaseConfigured) {
      // Demo mode - create a blob URL
      const blobUrl = URL.createObjectURL(file);
      return {
        url: blobUrl,
        path: `demo/${artistId}/${file.name}`
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${artistId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload audio file');
  }
};

export const deleteAudioFile = async (path: string): Promise<void> => {
  try {
    if (!isSupabaseConfigured) {
      // Demo mode - no actual deletion needed
      return;
    }

    const { error } = await supabase.storage
      .from('audio-files')
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete audio file');
  }
};

export const getAudioFileUrl = (path: string): string => {
  if (!isSupabaseConfigured) {
    // Demo mode - return placeholder URL
    return `https://example.com/demo-audio/${path}`;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('audio-files')
    .getPublicUrl(path);

  return publicUrl;
};

// Validate audio file before upload
export const validateAudioFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 50 * 1024 * 1024; // 50MB
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/flac', 'audio/aac'];
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 50MB'
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Supported formats: MP3, WAV, MP4, FLAC, AAC'
    };
  }

  return { valid: true };
};