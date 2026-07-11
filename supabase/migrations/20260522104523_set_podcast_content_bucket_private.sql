/*
  # Set podcast-content bucket to private

  The podcast-content bucket was created with public = true but now has
  owner-only RLS. Setting public = false ensures the /object/public/ endpoint
  also rejects unauthenticated requests at the bucket level.
*/
UPDATE storage.buckets SET public = false WHERE id = 'podcast-content';
