/*
  # Fix podcast-content Broad SELECT Policy
  Replaces "Anyone can view podcast content" with owner-folder check.
*/

DROP POLICY IF EXISTS "Anyone can view podcast content" ON storage.objects;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Owners can access own podcast content') THEN
    CREATE POLICY "Owners can access own podcast content" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'podcast-content' AND (storage.foldername(name))[1] = (auth.uid())::text);
  END IF;
END $$;
