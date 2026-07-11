/*
  # Remove MIME Type Restrictions from Storage Buckets
  
  1. Problem
    - Browsers detect MIME types differently (e.g., audio/mpeg vs audio/mp3)
    - File uploads failing due to strict MIME type checking
    - We already validate file types by extension in the code
  
  2. Solution
    - Remove MIME type restrictions from buckets entirely
    - Let code-level extension validation handle file type checking
    - Prevents browser MIME type detection issues
  
  3. Security
    - Extension validation in code is MORE reliable than MIME
    - RLS policies still enforce user-specific folders
    - File size limits still enforced
*/

-- Remove MIME type restrictions from audio-files bucket
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'audio-files';

-- Remove MIME type restrictions from video-content bucket
UPDATE storage.buckets
SET allowed_mime_types = NULL
WHERE id = 'video-content';

-- Verify changes
DO $$
DECLARE
  audio_allowed_types TEXT[];
  video_allowed_types TEXT[];
BEGIN
  SELECT allowed_mime_types INTO audio_allowed_types FROM storage.buckets WHERE id = 'audio-files';
  SELECT allowed_mime_types INTO video_allowed_types FROM storage.buckets WHERE id = 'video-content';
  
  IF audio_allowed_types IS NOT NULL OR video_allowed_types IS NOT NULL THEN
    RAISE EXCEPTION 'MIME type restrictions not removed properly!';
  END IF;
  
  RAISE NOTICE 'Storage buckets now accept all file types (validated by extension in code)';
END $$;
