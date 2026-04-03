/*
  # Fix RLS Auth Function Performance - Batch 3 Corrected

  1. Performance Improvements
    - Replace `auth.uid()` with `(select auth.uid())` to prevent re-evaluation per row

  2. Tables Updated
    - pack_assets (1 policy)
    - snippet_licenses (4 policies)
    - otp_attempts (1 policy)
    - instant_logins (1 policy)
    - audio_snippets (4 policies)
*/

-- Drop and recreate pack_assets policies with optimized auth calls
DROP POLICY IF EXISTS "pack_assets_creator_all" ON public.pack_assets;

CREATE POLICY "pack_assets_creator_all"
ON public.pack_assets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.audio_packs
    WHERE audio_packs.id = pack_assets.pack_id
    AND audio_packs.creator_id = (select auth.uid())
  )
);

-- Drop and recreate snippet_licenses policies with optimized auth calls
DROP POLICY IF EXISTS "licenses_creator_select" ON public.snippet_licenses;
DROP POLICY IF EXISTS "licenses_user_insert" ON public.snippet_licenses;
DROP POLICY IF EXISTS "licenses_user_select" ON public.snippet_licenses;
DROP POLICY IF EXISTS "licenses_user_update" ON public.snippet_licenses;

CREATE POLICY "licenses_creator_select"
ON public.snippet_licenses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.audio_snippets
    WHERE audio_snippets.id = snippet_licenses.snippet_id
    AND audio_snippets.artist_id = (select auth.uid())
  )
);

CREATE POLICY "licenses_user_insert"
ON public.snippet_licenses
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "licenses_user_select"
ON public.snippet_licenses
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY "licenses_user_update"
ON public.snippet_licenses
FOR UPDATE
TO authenticated
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Drop and recreate otp_attempts policy with optimized auth calls
DROP POLICY IF EXISTS "Users can view own OTP attempts" ON public.otp_attempts;

CREATE POLICY "Users can view own OTP attempts"
ON public.otp_attempts
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

-- Drop and recreate instant_logins policy with optimized auth calls
DROP POLICY IF EXISTS "Users can view own login history" ON public.instant_logins;

CREATE POLICY "Users can view own login history"
ON public.instant_logins
FOR SELECT
TO authenticated
USING (user_id = (select auth.uid()));

-- Drop and recreate audio_snippets policies with optimized auth calls
DROP POLICY IF EXISTS "snippets_creator_delete" ON public.audio_snippets;
DROP POLICY IF EXISTS "snippets_creator_insert" ON public.audio_snippets;
DROP POLICY IF EXISTS "snippets_creator_select" ON public.audio_snippets;
DROP POLICY IF EXISTS "snippets_creator_update" ON public.audio_snippets;

CREATE POLICY "snippets_creator_delete"
ON public.audio_snippets
FOR DELETE
TO authenticated
USING (artist_id = (select auth.uid()));

CREATE POLICY "snippets_creator_insert"
ON public.audio_snippets
FOR INSERT
TO authenticated
WITH CHECK (artist_id = (select auth.uid()));

CREATE POLICY "snippets_creator_select"
ON public.audio_snippets
FOR SELECT
TO authenticated
USING (artist_id = (select auth.uid()));

CREATE POLICY "snippets_creator_update"
ON public.audio_snippets
FOR UPDATE
TO authenticated
USING (artist_id = (select auth.uid()))
WITH CHECK (artist_id = (select auth.uid()));
