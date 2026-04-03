/*
  # Fix Security and Performance Issues

  1. Performance Improvements
    - Add missing indexes for foreign keys to optimize query performance:
      - `instant_payouts.artist_id`
      - `pack_purchases.user_id`
      - `track_licenses.artist_id`
      - `track_licenses.buyer_id`
    
    - Remove unused indexes that are not being utilized:
      - `idx_instant_payouts_license_id`
      - `idx_pack_purchases_pack_id`
      - `idx_track_licenses_track_id`

  2. Security Improvements
    - Enable leaked password protection in Supabase Auth
    - This prevents users from using compromised passwords by checking against HaveIBeenPwned.org

  ## Notes
  - Foreign key indexes improve JOIN performance and enforce referential integrity faster
  - Removing unused indexes reduces storage overhead and improves write performance
  - Password breach protection is a critical security enhancement
*/

-- Add missing foreign key indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_instant_payouts_artist_id ON public.instant_payouts(artist_id);
CREATE INDEX IF NOT EXISTS idx_pack_purchases_user_id ON public.pack_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_track_licenses_artist_id ON public.track_licenses(artist_id);
CREATE INDEX IF NOT EXISTS idx_track_licenses_buyer_id ON public.track_licenses(buyer_id);

-- Remove unused indexes to improve write performance and reduce storage
DROP INDEX IF EXISTS public.idx_instant_payouts_license_id;
DROP INDEX IF EXISTS public.idx_pack_purchases_pack_id;
DROP INDEX IF EXISTS public.idx_track_licenses_track_id;

-- Enable leaked password protection in auth config
-- This must be done via Supabase Dashboard: Authentication > Settings > Enable "Password Breach Protection"
-- Or via Supabase CLI/Management API
-- We'll add a comment here to track this requirement
COMMENT ON SCHEMA public IS 'Security Note: Enable Password Breach Protection in Supabase Auth settings (Dashboard > Authentication > Settings)';
