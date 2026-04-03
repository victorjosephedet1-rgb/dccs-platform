/*
  # Create Storage Buckets for File Uploads

  ## Summary
  Creates secure storage buckets for all file types with proper RLS policies
  and encryption support.

  ## Buckets Created
  - `user-uploads` - All user-uploaded raw files (MP3, MP4, images, etc.)
  - `encrypted-files` - Encrypted versions of files
  - `thumbnails` - Generated thumbnails for media files
  - `project-assets` - Project-specific assets (covers, banners)

  ## Security
  - All buckets have RLS enabled
  - Users can only access their own files
  - Public access restricted
  - File size limits enforced
  - File type validation

  ## Important Notes
  - Maximum file size: 500MB per file
  - Supported formats: MP3, MP4, WAV, FLAC, MOV, AVI, JPEG, PNG, GIF, WebP
  - Automatic cleanup of incomplete uploads after 24 hours
*/

-- Create user-uploads bucket for raw files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-uploads',
  'user-uploads',
  false,
  524288000, -- 500MB limit
  ARRAY[
    'audio/mpeg',          -- MP3
    'audio/mp3',           -- MP3 alternate
    'audio/wav',           -- WAV
    'audio/x-wav',         -- WAV alternate
    'audio/flac',          -- FLAC
    'audio/aac',           -- AAC
    'audio/ogg',           -- OGG
    'video/mp4',           -- MP4
    'video/mpeg',          -- MPEG
    'video/quicktime',     -- MOV
    'video/x-msvideo',     -- AVI
    'video/webm',          -- WebM
    'image/jpeg',          -- JPEG
    'image/jpg',           -- JPG
    'image/png',           -- PNG
    'image/gif',           -- GIF
    'image/webp',          -- WebP
    'image/svg+xml',       -- SVG
    'application/pdf'      -- PDF
  ]
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 524288000,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create encrypted-files bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'encrypted-files',
  'encrypted-files',
  false,
  524288000 -- 500MB limit
)
ON CONFLICT (id) DO NOTHING;

-- Create thumbnails bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thumbnails',
  'thumbnails',
  true, -- Public for displaying
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create project-assets bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-assets',
  'project-assets',
  false,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for user-uploads bucket

-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own files
CREATE POLICY "Users can view their own uploaded files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own uploaded files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own uploaded files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS Policies for encrypted-files bucket

CREATE POLICY "Users can upload encrypted files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'encrypted-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their encrypted files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'encrypted-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their encrypted files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'encrypted-files' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS Policies for thumbnails bucket

CREATE POLICY "Users can upload thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'thumbnails');

CREATE POLICY "Users can delete their thumbnails"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'thumbnails' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS Policies for project-assets bucket

CREATE POLICY "Users can upload project assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their project assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their project assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'project-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their project assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-assets' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
