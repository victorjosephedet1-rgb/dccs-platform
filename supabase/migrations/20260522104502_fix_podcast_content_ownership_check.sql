/*
  # Fix podcast-content Broad SELECT Policy

  ## Problem
  "Anyone can view podcast content" allows any authenticated user to access
  any file in the podcast-content bucket — no ownership check. A logged-in
  user from a different account could access another creator's podcast files.

  ## Fix
  Replace the broad policy with an owner-folder check matching the other
  private buckets: the first path segment must equal the authenticated user's ID.
*/

DROP POLICY IF EXISTS "Anyone can view podcast content" ON storage.objects;

CREATE POLICY "Owners can access own podcast content"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'podcast-content'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);
