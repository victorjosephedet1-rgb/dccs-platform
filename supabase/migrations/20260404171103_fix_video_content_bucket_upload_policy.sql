/*
  # Fix video-content Bucket Upload Policy
  
  1. Issue
    - audio-files bucket requires folder structure: user_id/filename
    - video-content bucket doesn't check folder structure
    - This causes uploads to fail due to inconsistent policies
  
  2. Solution
    - Update video-content upload policy to match audio-files structure
    - Require: bucket_id = 'video-content' AND folder starts with user_id
    - This ensures users can only upload to their own folders
  
  3. Security
    - Users can only upload files to their own user_id folder
    - Prevents unauthorized file uploads to other users' folders
*/

-- Drop the old policy
DROP POLICY IF EXISTS "Authenticated users can upload video content" ON storage.objects;

-- Create new policy with folder structure check (matching audio-files)
CREATE POLICY "Authenticated users can upload video content"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'video-content' 
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Verify policy was created
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname = 'Authenticated users can upload video content'
  ) THEN
    RAISE EXCEPTION 'Failed to create video-content upload policy';
  END IF;
  
  RAISE NOTICE 'video-content upload policy updated successfully to match audio-files structure';
END $$;
