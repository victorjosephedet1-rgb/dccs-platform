/*
  # Drop Residual Public SELECT Policies on Private Buckets

  ## Problem
  After setting audio-files, video-content, and profile-assets to public = false,
  old policies from earlier migrations still exist with roles: {public} or broad
  authenticated SELECT that bypass ownership checks. Supabase RLS is PERMISSIVE
  by default — any matching policy grants access, so two policies means the
  looser one wins.

  ## What This Drops
  - audio_files_read           — public SELECT on audio-files (no ownership check)
  - Anyone can view video content — authenticated broad SELECT on video-content
  - profile_assets_read        — public SELECT on profile-assets (no ownership check)
  - profile_assets_delete (old) — uses wrong folder structure (gallery/thumbnails prefix)
  - profile_assets_update (old) — uses wrong folder structure

  ## What Remains (Correct Policies)
  - Owners can access own audio files     — authenticated, folder = auth.uid()
  - Owners can access own video files     — authenticated, folder = auth.uid()
  - Owners can access own profile assets  — authenticated, folder = auth.uid()
  - All INSERT/DELETE policies remain intact

  ## Result
  Zero public or unauthenticated SELECT access on any private bucket.
  Every access requires a valid session AND ownership of the folder.
*/

-- ─── audio-files: drop the old blanket public read policy ────────────────────
DROP POLICY IF EXISTS "audio_files_read"                    ON storage.objects;
DROP POLICY IF EXISTS "Public read access for audio files"  ON storage.objects;
DROP POLICY IF EXISTS "Public audio access"                 ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view audio files"         ON storage.objects;

-- ─── video-content: drop the broad authenticated (no ownership check) policy ─
DROP POLICY IF EXISTS "Anyone can view video content"       ON storage.objects;
DROP POLICY IF EXISTS "Public read access for video content" ON storage.objects;
DROP POLICY IF EXISTS "Public video access"                 ON storage.objects;

-- ─── profile-assets: drop all old public/broad policies ──────────────────────
DROP POLICY IF EXISTS "profile_assets_read"                 ON storage.objects;
DROP POLICY IF EXISTS "profile_assets_delete"               ON storage.objects;
DROP POLICY IF EXISTS "profile_assets_update"               ON storage.objects;
DROP POLICY IF EXISTS "Public read for profile assets"      ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile assets"      ON storage.objects;

-- ─── Ensure correct owner-scoped policies exist (idempotent) ─────────────────

-- audio-files owner SELECT (recreate to be sure)
DROP POLICY IF EXISTS "Owners can access own audio files"   ON storage.objects;
CREATE POLICY "Owners can access own audio files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'audio-files'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- video-content owner SELECT (recreate to be sure)
DROP POLICY IF EXISTS "Owners can access own video files"   ON storage.objects;
CREATE POLICY "Owners can access own video files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'video-content'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- profile-assets owner SELECT (recreate to be sure — folder[1] is user id)
DROP POLICY IF EXISTS "Owners can access own profile assets" ON storage.objects;
CREATE POLICY "Owners can access own profile assets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'profile-assets'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- profile-assets correct UPDATE (folder[1] = user id, not gallery/thumbnails prefix)
DROP POLICY IF EXISTS "Owners can update own profile assets" ON storage.objects;
CREATE POLICY "Owners can update own profile assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-assets'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

-- profile-assets correct DELETE
DROP POLICY IF EXISTS "Owners can delete own profile assets" ON storage.objects;
CREATE POLICY "Owners can delete own profile assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-assets'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);
