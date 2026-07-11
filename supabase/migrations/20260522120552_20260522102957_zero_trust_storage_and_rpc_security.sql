/*
  # Zero-Trust Storage & RPC Security Hardening
*/

UPDATE storage.buckets SET public = false WHERE id = 'audio-files';
DROP POLICY IF EXISTS "Public read access for audio files" ON storage.objects;
DROP POLICY IF EXISTS "Public audio access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view audio" ON storage.objects;
DROP POLICY IF EXISTS "Public read for audio-files" ON storage.objects;
DROP POLICY IF EXISTS "Owners can access own audio files" ON storage.objects;
CREATE POLICY "Owners can access own audio files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'audio-files' AND (storage.foldername(name))[1] = (auth.uid())::text);
DROP POLICY IF EXISTS "Authenticated users can upload audio" ON storage.objects;
CREATE POLICY "Authenticated users can upload audio" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'audio-files' AND (storage.foldername(name))[1] = (auth.uid())::text);
DROP POLICY IF EXISTS "Owners can delete own audio files" ON storage.objects;
CREATE POLICY "Owners can delete own audio files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'audio-files' AND (storage.foldername(name))[1] = (auth.uid())::text);

UPDATE storage.buckets SET public = false WHERE id = 'video-content';
DROP POLICY IF EXISTS "Public read access for video content" ON storage.objects;
DROP POLICY IF EXISTS "Public video access" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view video" ON storage.objects;
DROP POLICY IF EXISTS "Public read for video-content" ON storage.objects;
DROP POLICY IF EXISTS "Owners can access own video files" ON storage.objects;
CREATE POLICY "Owners can access own video files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'video-content' AND (storage.foldername(name))[1] = (auth.uid())::text);
DROP POLICY IF EXISTS "Authenticated users can upload video content" ON storage.objects;
CREATE POLICY "Authenticated users can upload video content" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'video-content' AND (storage.foldername(name))[1] = (auth.uid())::text);
DROP POLICY IF EXISTS "Owners can delete own video files" ON storage.objects;
CREATE POLICY "Owners can delete own video files" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'video-content' AND (storage.foldername(name))[1] = (auth.uid())::text);

UPDATE storage.buckets SET public = false WHERE id = 'profile-assets';
DROP POLICY IF EXISTS "Profile assets public read policy" ON storage.objects;
DROP POLICY IF EXISTS "Public read for profile assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile assets" ON storage.objects;
DROP POLICY IF EXISTS "Owners can access own profile assets" ON storage.objects;
CREATE POLICY "Owners can access own profile assets" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = (auth.uid())::text);
DROP POLICY IF EXISTS "Authenticated users can upload profile assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload profile assets" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = (auth.uid())::text);
DROP POLICY IF EXISTS "Owners can delete own profile assets" ON storage.objects;
CREATE POLICY "Owners can delete own profile assets" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'profile-assets' AND (storage.foldername(name))[1] = (auth.uid())::text);

DROP POLICY IF EXISTS "Users can access own files" ON storage.objects;
CREATE POLICY "Users can access own files" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'user-uploads' AND (storage.foldername(name))[1] = (auth.uid())::text);

DO $$
DECLARE
  func_name text;
  func_names text[] := ARRAY[
    'activate_split_version','audit_dccs_modifications','audit_payment_modifications',
    'auto_unlock_dccs_downloads','calculate_confidence_level','calculate_creator_platform_split',
    'calculate_dccs_royalty_split','process_ongoing_royalties','process_crypto_payout',
    'create_payment_intent','record_royalty_payment','sync_platform_usage',
    'increment_health_check_count','update_deployment_runs_updated_at',
    'generate_dccs_clearance_code','verify_dccs_ownership','register_dccs_fingerprint',
    'create_dccs_certificate','process_instant_payout','split_royalty_payment',
    'lock_platform_config','create_ownership_record','flag_duplicate_fingerprint',
    'generate_certificate_hash'
  ];
BEGIN
  FOREACH func_name IN ARRAY func_names LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I FROM anon', func_name);
    EXCEPTION WHEN undefined_function THEN NULL; WHEN undefined_object THEN NULL; WHEN others THEN NULL;
    END;
  END LOOP;
END $$;
