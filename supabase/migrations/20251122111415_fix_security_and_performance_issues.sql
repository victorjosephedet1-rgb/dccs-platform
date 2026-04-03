/*
  # Fix Security and Performance Issues

  1. Add Missing Foreign Key Indexes
    - Add index on `instant_payouts.license_id`
    - Add index on `pack_purchases.pack_id`
    - Add index on `track_licenses.track_id`

  2. Remove Unused Indexes
    - Drop `idx_audio_snippets_genre_active`
    - Drop `idx_track_licenses_buyer`
    - Drop `idx_track_licenses_artist`
    - Drop `idx_profiles_slug`
    - Drop `idx_pack_purchases_user`
    - Drop `idx_instant_payouts_artist`

  3. Fix Function Security
    - Fix search_path for `generate_profile_slug` function

  ## Performance Impact
  - Adding foreign key indexes will improve JOIN performance
  - Removing unused indexes will reduce write overhead and storage

  ## Security Impact
  - Fixing function search_path prevents potential schema injection attacks
*/

-- Add missing foreign key indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_instant_payouts_license_id ON public.instant_payouts(license_id);
CREATE INDEX IF NOT EXISTS idx_pack_purchases_pack_id ON public.pack_purchases(pack_id);
CREATE INDEX IF NOT EXISTS idx_track_licenses_track_id ON public.track_licenses(track_id);

-- Remove unused indexes to reduce write overhead
DROP INDEX IF EXISTS public.idx_audio_snippets_genre_active;
DROP INDEX IF EXISTS public.idx_track_licenses_buyer;
DROP INDEX IF EXISTS public.idx_track_licenses_artist;
DROP INDEX IF EXISTS public.idx_profiles_slug;
DROP INDEX IF EXISTS public.idx_pack_purchases_user;
DROP INDEX IF EXISTS public.idx_instant_payouts_artist;

-- Fix function search_path security issue
DROP FUNCTION IF EXISTS public.generate_profile_slug(text);

CREATE OR REPLACE FUNCTION public.generate_profile_slug(username text)
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
  -- Generate base slug from username
  base_slug := lower(regexp_replace(username, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure slug is not empty
  IF base_slug = '' THEN
    base_slug := 'user';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for uniqueness and append counter if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;