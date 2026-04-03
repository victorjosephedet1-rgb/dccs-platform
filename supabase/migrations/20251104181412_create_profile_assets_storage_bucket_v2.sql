/*
  # Profile Assets Storage Bucket

  ## Overview
  Creates a storage bucket for artist/creator profile assets including gallery images and video thumbnails.

  ## Storage Configuration
  - Bucket name: `profile-assets`
  - Public access: Yes (for viewing profile content)
  - File size limit: 5MB per file
  - Allowed file types: Images (JPG, PNG, WebP, GIF)

  ## Security
  - Artists can upload to their own folders
  - Public read access for all users
  - RLS policies ensure users can only modify their own content

  ## File Structure
  - `gallery/{profile_id}/{filename}` - Gallery images
  - `thumbnails/{profile_id}/{filename}` - Video thumbnails
*/

-- Create the storage bucket for profile assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-assets',
  'profile-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Public can view all profile assets" ON storage.objects;
DROP POLICY IF EXISTS "Profile assets upload policy" ON storage.objects;
DROP POLICY IF EXISTS "Profile assets update policy" ON storage.objects;
DROP POLICY IF EXISTS "Profile assets delete policy" ON storage.objects;
DROP POLICY IF EXISTS "Profile assets public read policy" ON storage.objects;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Profile assets upload policy"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'profile-assets' AND
    (storage.foldername(name))[1] IN ('gallery', 'thumbnails') AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow authenticated users to update their own files
CREATE POLICY "Profile assets update policy"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'profile-assets' AND
    (storage.foldername(name))[1] IN ('gallery', 'thumbnails') AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow authenticated users to delete their own files
CREATE POLICY "Profile assets delete policy"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'profile-assets' AND
    (storage.foldername(name))[1] IN ('gallery', 'thumbnails') AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Allow public read access to all profile assets
CREATE POLICY "Profile assets public read policy"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile-assets');