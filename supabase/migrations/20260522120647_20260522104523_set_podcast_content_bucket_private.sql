/*
  # Set podcast-content bucket to private
*/

UPDATE storage.buckets SET public = false WHERE id = 'podcast-content';
