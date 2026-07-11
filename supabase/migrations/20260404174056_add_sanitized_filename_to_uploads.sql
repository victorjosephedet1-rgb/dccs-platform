/*
  # Add sanitized_filename column to uploads table
  
  1. Problem
    - Upload code tries to insert 'sanitized_filename' column
    - Column doesn't exist in uploads table
    - Causes PGRST204 error: "Could not find the 'sanitized_filename' column"
  
  2. Solution
    - Add sanitized_filename column to uploads table
    - Make it nullable to support existing records
    - Will store the sanitized version of the filename (no spaces, special chars)
  
  3. Purpose
    - Track both original filename (for display) and sanitized filename (for storage)
    - Helps with file system compatibility
    - Useful for debugging upload issues
*/

-- Add sanitized_filename column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'uploads'
      AND column_name = 'sanitized_filename'
  ) THEN
    ALTER TABLE uploads ADD COLUMN sanitized_filename TEXT;
    RAISE NOTICE 'Added sanitized_filename column to uploads table';
  ELSE
    RAISE NOTICE 'sanitized_filename column already exists';
  END IF;
END $$;

-- Also add file_url column if it doesn't exist (needed for completed uploads)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'uploads'
      AND column_name = 'file_url'
  ) THEN
    ALTER TABLE uploads ADD COLUMN file_url TEXT;
    RAISE NOTICE 'Added file_url column to uploads table';
  ELSE
    RAISE NOTICE 'file_url column already exists';
  END IF;
END $$;

-- Verify columns exist
DO $$
DECLARE
  sanitized_exists BOOLEAN;
  url_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'uploads'
      AND column_name = 'sanitized_filename'
  ) INTO sanitized_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'uploads'
      AND column_name = 'file_url'
  ) INTO url_exists;
  
  IF NOT sanitized_exists OR NOT url_exists THEN
    RAISE EXCEPTION 'Required columns not added properly!';
  END IF;
  
  RAISE NOTICE 'All required columns verified: sanitized_filename, file_url';
END $$;
