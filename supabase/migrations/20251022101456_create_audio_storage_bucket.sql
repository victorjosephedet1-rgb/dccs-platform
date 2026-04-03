/*
  # Create Audio Files Storage Bucket

  1. Storage Setup
    - Create 'audio-files' bucket for music uploads
    - Set file size limit to 500MB (524,288,000 bytes)
    - Allow audio file types only
    - Enable public access for audio playback

  2. Security Policies
    - Artists can upload to their own folder
    - Anyone can read/download audio files
    - Only owners can delete their files
*/

-- Create the audio-files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-files',
  'audio-files',
  true,
  524288000,
  ARRAY['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/webm', 'audio/mp3', 'audio/x-wav']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Allow authenticated users to upload to their own folder
CREATE POLICY "Artists can upload to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy: Anyone can read/download audio files (needed for playback)
CREATE POLICY "Public read access for audio files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'audio-files');

-- Storage Policy: Users can update their own files
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'audio-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'audio-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy: Users can delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
