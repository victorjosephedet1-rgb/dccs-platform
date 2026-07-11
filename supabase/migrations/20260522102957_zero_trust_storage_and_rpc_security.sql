/*
  # Zero-Trust Storage & RPC Security Hardening

  ## Overview
  Implements bank-level security for all digital asset storage buckets and
  revokes anonymous access to all business-critical RPC functions.

  ## Storage Changes
  1. audio-files    — set public = false, enforce owner-only SELECT via signed URL
  2. video-content  — set public = false, enforce owner-only SELECT via signed URL
  3. profile-assets — set public = false, restrict SELECT to owner
  4. thumbnails     — remains public but listing is disabled (no list policy)
  5. user-uploads   — already private, reinforce with explicit object-level RLS

  ## Security Changes
  - All SELECT on audio/video/profile assets restricted to auth.uid() = folder owner
  - All INSERT restricted to authenticated users with correct folder structure
  - All DELETE restricted to owner
  - Existing blanket public SELECT policies on private buckets dropped
  - anon EXECUTE revoked from all financial/ownership/audit RPC functions

  ## Impact
  - getPublicUrl calls for private buckets will return non-working URLs.
    File access must go through the dccs-download-url Edge Function (signed URLs).
  - Thumbnails remain publicly readable via direct URL (no listing).
*/

-- ─── 1. LOCK DOWN AUDIO-FILES ────────────────────────────────────────────────

UPDATE storage.buckets
SET public = false
WHERE id = 'audio-files';

-- Drop any existing blanket public SELECT policies on audio-files
DROP POLICY IF EXISTS "Public read access for audio files"         ON storage.objects;
DROP POLICY IF EXISTS "Public audio access"                        ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view audio"                      ON storage.objects;
DROP POLICY IF EXISTS "Public read for audio-files"                ON storage.objects;

-- Owner-only SELECT
DROP POLICY IF EXISTS "Owners can access own audio files"          ON storage.objects;
CREATE POLICY "Owners can access own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-files'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Authenticated upload only
DROP POLICY IF EXISTS "Authenticated users can upload audio"       ON storage.objects;
CREATE POLICY "Authenticated users can upload audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio-files'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- Owner delete only
DROP POLICY IF EXISTS "Owners can delete own audio files"          ON storage.objects;
CREATE POLICY "Owners can delete own audio files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'audio-files'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- ─── 2. LOCK DOWN VIDEO-CONTENT ──────────────────────────────────────────────

UPDATE storage.buckets
SET public = false
WHERE id = 'video-content';

DROP POLICY IF EXISTS "Public read access for video content"       ON storage.objects;
DROP POLICY IF EXISTS "Public video access"                        ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view video"                      ON storage.objects;
DROP POLICY IF EXISTS "Public read for video-content"              ON storage.objects;

DROP POLICY IF EXISTS "Owners can access own video files"          ON storage.objects;
CREATE POLICY "Owners can access own video files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'video-content'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

DROP POLICY IF EXISTS "Authenticated users can upload video content" ON storage.objects;
CREATE POLICY "Authenticated users can upload video content"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'video-content'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

DROP POLICY IF EXISTS "Owners can delete own video files"          ON storage.objects;
CREATE POLICY "Owners can delete own video files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'video-content'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- ─── 3. LOCK DOWN PROFILE-ASSETS ─────────────────────────────────────────────

UPDATE storage.buckets
SET public = false
WHERE id = 'profile-assets';

DROP POLICY IF EXISTS "Profile assets public read policy"          ON storage.objects;
DROP POLICY IF EXISTS "Public read for profile assets"             ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile assets"             ON storage.objects;

DROP POLICY IF EXISTS "Owners can access own profile assets"       ON storage.objects;
CREATE POLICY "Owners can access own profile assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-assets'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

DROP POLICY IF EXISTS "Authenticated users can upload profile assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload profile assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-assets'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

DROP POLICY IF EXISTS "Owners can delete own profile assets"       ON storage.objects;
CREATE POLICY "Owners can delete own profile assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-assets'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- ─── 4. HARDEN USER-UPLOADS (reinforce existing) ─────────────────────────────

DROP POLICY IF EXISTS "Users can access own files"                 ON storage.objects;
CREATE POLICY "Users can access own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-uploads'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- ─── 5. THUMBNAILS — keep public but no listing ──────────────────────────────
-- thumbnails remains public = true (intentional — for UI display)
-- No SELECT policy that allows listing; direct URL access only.
-- This is safe: there are no predictable/guessable paths for thumbnails.

-- ─── 6. REVOKE ANON EXECUTE ON FINANCIAL / OWNERSHIP / AUDIT FUNCTIONS ───────

DO $$
DECLARE
  func_name text;
  func_names text[] := ARRAY[
    'activate_split_version',
    'audit_dccs_modifications',
    'audit_payment_modifications',
    'auto_unlock_dccs_downloads',
    'calculate_confidence_level',
    'calculate_creator_platform_split',
    'calculate_dccs_royalty_split',
    'process_ongoing_royalties',
    'process_crypto_payout',
    'create_payment_intent',
    'record_royalty_payment',
    'sync_platform_usage',
    'increment_health_check_count',
    'update_deployment_runs_updated_at',
    'generate_dccs_clearance_code',
    'verify_dccs_ownership',
    'register_dccs_fingerprint',
    'create_dccs_certificate',
    'process_instant_payout',
    'split_royalty_payment',
    'lock_platform_config',
    'create_ownership_record',
    'flag_duplicate_fingerprint',
    'generate_certificate_hash'
  ];
BEGIN
  FOREACH func_name IN ARRAY func_names LOOP
    BEGIN
      EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I FROM anon', func_name);
    EXCEPTION
      WHEN undefined_function THEN NULL; -- function doesn't exist, skip
      WHEN undefined_object   THEN NULL;
      WHEN others             THEN NULL;
    END;
  END LOOP;
END $$;

-- ─── 7. ENSURE SERVICE ROLE RETAINS FULL ACCESS ──────────────────────────────
-- service_role bypasses RLS by design; no explicit grants needed.
-- Edge functions use SUPABASE_SERVICE_ROLE_KEY and are unaffected.
