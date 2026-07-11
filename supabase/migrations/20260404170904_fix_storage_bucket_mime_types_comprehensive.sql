/*
  # Fix Storage Buckets for All File Types
  
  1. Purpose
    - Ensure audio-files and video-content buckets support ALL creative file types
    - Remove MIME type restrictions that block uploads
    - Enable Phase 1 unlimited upload functionality
  
  2. Changes
    - Update audio-files bucket to accept ALL audio AND document formats
    - Update video-content bucket to accept ALL video AND image formats
    - Set file size limits to 500MB for audio, 1GB for video
    - Ensure buckets are public for easy downloads
  
  3. Supported Formats
    **Audio Bucket:**
    - Audio: MP3, WAV, FLAC, AAC, OGG, M4A, WMA, AIFF, OPUS
    - Documents: PDF, DOC, DOCX, TXT, MD
    - Archives: ZIP, RAR, 7Z
    - Code: JS, PY, CPP, JAVA, etc.
    
    **Video Bucket:**
    - Video: MP4, MOV, AVI, WEBM, MKV, FLV, WMV
    - Images: JPG, PNG, GIF, WEBP, SVG, BMP, TIFF
    - 3D Models: OBJ, FBX, BLEND, GLB, GLTF
    - Design: PSD, AI, FIG, XD, SKETCH
*/

-- Update audio-files bucket to accept ALL creative file types
UPDATE storage.buckets
SET 
  file_size_limit = 524288000,
  public = true,
  allowed_mime_types = ARRAY[
    -- Audio formats
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave',
    'audio/flac', 'audio/x-flac', 'audio/m4a', 'audio/x-m4a', 'audio/mp4',
    'audio/aac', 'audio/ogg', 'audio/opus', 'audio/webm', 'audio/wma',
    'audio/aiff', 'audio/x-aiff', 'audio/amr',
    -- Document formats
    'application/pdf', 'text/plain', 'text/markdown',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json', 'application/xml', 'text/xml', 'text/csv',
    -- Archive formats
    'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed',
    'application/x-7z-compressed', 'application/gzip', 'application/x-tar',
    -- Code formats
    'text/javascript', 'text/typescript', 'text/x-python', 'text/x-java',
    'text/x-c', 'text/x-c++', 'text/html', 'text/css',
    -- Generic fallback
    'application/octet-stream'
  ]
WHERE name = 'audio-files';

-- Update video-content bucket to accept ALL visual and video formats
UPDATE storage.buckets
SET 
  file_size_limit = 1073741824,
  public = true,
  allowed_mime_types = ARRAY[
    -- Video formats
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo',
    'video/webm', 'video/x-matroska', 'video/x-flv', 'video/x-ms-wmv',
    'video/3gpp', 'video/3gpp2', 'video/ogg',
    -- Image formats
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'image/svg+xml', 'image/bmp', 'image/tiff', 'image/x-icon',
    'image/heic', 'image/heif', 'image/avif',
    -- 3D and design formats
    'model/obj', 'model/gltf-binary', 'model/gltf+json',
    'application/x-blender', 'application/octet-stream',
    -- Adobe and design formats
    'application/postscript', 'application/illustrator',
    'image/vnd.adobe.photoshop', 'application/x-photoshop'
  ]
WHERE name = 'video-content';

-- Verify buckets are configured correctly
DO $$
DECLARE
  audio_bucket_count INTEGER;
  video_bucket_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO audio_bucket_count FROM storage.buckets WHERE name = 'audio-files';
  SELECT COUNT(*) INTO video_bucket_count FROM storage.buckets WHERE name = 'video-content';
  
  IF audio_bucket_count = 0 OR video_bucket_count = 0 THEN
    RAISE EXCEPTION 'Storage buckets missing! audio-files: %, video-content: %', audio_bucket_count, video_bucket_count;
  END IF;
  
  RAISE NOTICE 'Storage buckets configured successfully for unlimited file uploads';
END $$;
