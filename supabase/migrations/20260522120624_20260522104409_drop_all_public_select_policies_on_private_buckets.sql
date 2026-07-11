/*
  # Drop Residual Public SELECT Policies on Private Buckets
  Removes old permissive policies left from earlier migrations.
  Recreates correct owner-scoped policies idempotently.
*/

DROP POLICY IF EXISTS "audio_files_read" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for audio files" ON storage.objects;
DROP POLICY IF EXISTS "Public audio access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view audio files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view video content" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for video content" ON storage.objects;
DROP POLICY IF EXISTS "Public video access" ON storage.objects;
DROP POLICY IF EXISTS "profile_assets_read" ON storage.objects;
DROP POLICY IF EXISTS "profile_assets_delete" ON storage.objects;
DROP POLICY IF EXISTS "profile_assets_update" ON storage.objects;
DROP POLICY IF EXISTS "Public read for profile assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile assets" ON storage.objects;

DROP POLICY IF EXISTS "Owners can access own audio files" ON storage.objects;
CREATE POLICY "Owners can access own audio files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'audio-files' AND (storage.foldername(name))[1] = (auth.uid())::text);

DROP POLICY IF EXISTS "Owners can access own video files" ON storage.objects;
CREATE POLICY "Owners can access own video files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'video-content' AND (storage.foldername(name))[1] = (auth.uid())::text);

DROP POLICY IF EXISTS "Owners can access own profile assets" ON storage.objects;
CREATE POLICY "Owners can access own profile assets" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = (auth.uid())::text);

DROP POLICY IF EXISTS "Owners can update own profile assets" ON storage.objects;
CREATE POLICY "Owners can update own profile assets" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = (auth.uid())::text);

DROP POLICY IF EXISTS "Owners can delete own profile assets" ON storage.objects;
CREATE POLICY "Owners can delete own profile assets" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = (auth.uid())::text);
