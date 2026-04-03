/*
  # Fix Critical Security and Performance Issues

  ## Issues Fixed:
  1. RLS Performance - Changed auth.uid() to (select auth.uid()) in all policies
  2. Multiple Permissive Policies - Consolidated overlapping SELECT policies  
  3. Unused Indexes - Removed indexes that aren't being used
  4. Function Search Path - Fixed generate_profile_slug security vulnerability
  5. Added Better Indexes - Created composite indexes for common query patterns

  ## Security Impact:
  - ✅ Query performance optimized (no re-evaluation per row)
  - ✅ Clear permission model (no conflicting policies)
  - ✅ Reduced index overhead
  - ✅ Prevented SQL injection via search_path
*/

-- ============================================================================
-- 1. FIX PROFILES TABLE - CONSOLIDATE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

-- Single unified SELECT policy (no more duplicates)
CREATE POLICY "Anyone can view profiles"
  ON public.profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- ============================================================================
-- 2. FIX AUDIO_SNIPPETS TABLE - CONSOLIDATE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Artists can manage own snippets" ON public.audio_snippets;
DROP POLICY IF EXISTS "Anyone can read active snippets" ON public.audio_snippets;

-- Single unified SELECT policy (no more duplicates)
CREATE POLICY "Anyone can view active snippets"
  ON public.audio_snippets
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Artists can insert snippets"
  ON public.audio_snippets
  FOR INSERT
  TO authenticated
  WITH CHECK (artist_id = (select auth.uid()));

CREATE POLICY "Artists can update own snippets"
  ON public.audio_snippets
  FOR UPDATE
  TO authenticated
  USING (artist_id = (select auth.uid()))
  WITH CHECK (artist_id = (select auth.uid()));

CREATE POLICY "Artists can delete own snippets"
  ON public.audio_snippets
  FOR DELETE
  TO authenticated
  USING (artist_id = (select auth.uid()));

-- ============================================================================
-- 3. FIX AUDIO_PACKS TABLE - CONSOLIDATE POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Creators can manage own packs" ON public.audio_packs;
DROP POLICY IF EXISTS "Anyone can read active packs" ON public.audio_packs;

-- Single unified SELECT policy (no more duplicates)
CREATE POLICY "Anyone can view active packs"
  ON public.audio_packs
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Creators can insert packs"
  ON public.audio_packs
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = (select auth.uid()));

CREATE POLICY "Creators can update own packs"
  ON public.audio_packs
  FOR UPDATE
  TO authenticated
  USING (creator_id = (select auth.uid()))
  WITH CHECK (creator_id = (select auth.uid()));

CREATE POLICY "Creators can delete own packs"
  ON public.audio_packs
  FOR DELETE
  TO authenticated
  USING (creator_id = (select auth.uid()));

-- ============================================================================
-- 4. FIX TRACK_LICENSES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own licenses" ON public.track_licenses;

CREATE POLICY "Users can view own licenses"
  ON public.track_licenses
  FOR SELECT
  TO authenticated
  USING (
    buyer_id = (select auth.uid()) OR
    artist_id = (select auth.uid())
  );

CREATE POLICY "Users can create licenses"
  ON public.track_licenses
  FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = (select auth.uid()));

-- ============================================================================
-- 5. FIX PACK_PURCHASES TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own purchases" ON public.pack_purchases;

CREATE POLICY "Users can view own purchases"
  ON public.pack_purchases
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create purchases"
  ON public.pack_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- ============================================================================
-- 6. FIX INSTANT_PAYOUTS TABLE
-- ============================================================================

DROP POLICY IF EXISTS "Artists can view own payouts" ON public.instant_payouts;

CREATE POLICY "Artists can view own payouts"
  ON public.instant_payouts
  FOR SELECT
  TO authenticated
  USING (artist_id = (select auth.uid()));

-- ============================================================================
-- 7. REMOVE UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_track_licenses_buyer_id;
DROP INDEX IF EXISTS public.idx_track_licenses_artist_id;
DROP INDEX IF EXISTS public.idx_track_licenses_track_id;
DROP INDEX IF EXISTS public.idx_pack_purchases_user_id;
DROP INDEX IF EXISTS public.idx_pack_purchases_pack_id;
DROP INDEX IF EXISTS public.idx_instant_payouts_artist_id;
DROP INDEX IF EXISTS public.idx_instant_payouts_license_id;

-- ============================================================================
-- 8. FIX FUNCTION SEARCH PATH VULNERABILITY
-- ============================================================================

DROP FUNCTION IF EXISTS public.generate_profile_slug(text);

CREATE OR REPLACE FUNCTION public.generate_profile_slug(input_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 0;
BEGIN
  base_slug := lower(regexp_replace(input_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '^-|-$', '', 'g');

  IF base_slug = '' THEN
    base_slug := 'artist';
  END IF;

  final_slug := base_slug;

  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE profile_slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN final_slug;
END;
$$;

GRANT EXECUTE ON FUNCTION public.generate_profile_slug(text) TO authenticated;

-- ============================================================================
-- 9. ADD OPTIMIZED COMPOSITE INDEXES
-- ============================================================================

-- For artist dashboard queries (frequently accessed)
CREATE INDEX IF NOT EXISTS idx_audio_snippets_artist_active
  ON public.audio_snippets(artist_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_audio_packs_creator_active
  ON public.audio_packs(creator_id)
  WHERE is_active = true;

-- For marketplace searches (genre is frequently filtered)
CREATE INDEX IF NOT EXISTS idx_audio_snippets_genre_active
  ON public.audio_snippets(genre)
  WHERE is_active = true;

-- For license verification and downloads
CREATE INDEX IF NOT EXISTS idx_track_licenses_buyer
  ON public.track_licenses(buyer_id);

CREATE INDEX IF NOT EXISTS idx_track_licenses_artist
  ON public.track_licenses(artist_id);

-- For profile slug lookups (used in artist profile pages)
CREATE INDEX IF NOT EXISTS idx_profiles_slug
  ON public.profiles(profile_slug)
  WHERE profile_slug IS NOT NULL;

-- For pack purchases lookup
CREATE INDEX IF NOT EXISTS idx_pack_purchases_user
  ON public.pack_purchases(user_id);

-- For instant payouts dashboard
CREATE INDEX IF NOT EXISTS idx_instant_payouts_artist
  ON public.instant_payouts(artist_id);

-- ============================================================================
-- 10. ENSURE RLS IS ENABLED ON ALL TABLES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.track_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instant_payouts ENABLE ROW LEVEL SECURITY;
