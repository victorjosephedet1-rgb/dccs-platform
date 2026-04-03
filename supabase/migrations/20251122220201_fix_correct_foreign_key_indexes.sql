/*
  # Fix Foreign Key Index Issues

  1. Performance Improvements
    - Add missing indexes for foreign keys to optimize query performance:
      - `instant_payouts.license_id`
      - `pack_purchases.pack_id`
      - `track_licenses.track_id`
    
    - Remove unused indexes that are not being utilized:
      - `idx_instant_payouts_artist_id`
      - `idx_pack_purchases_user_id`
      - `idx_track_licenses_artist_id`
      - `idx_track_licenses_buyer_id`

  2. Security Note
    - Password breach protection must be enabled manually in Supabase Dashboard
    - Navigate to: Authentication > Settings > Enable "Password Breach Protection"

  ## Notes
  - Foreign key indexes improve JOIN performance and referential integrity checks
  - Removing unused indexes reduces storage overhead and improves write performance
  - These changes ensure indexes align with actual query patterns
*/

-- Add missing foreign key indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_instant_payouts_license_id ON public.instant_payouts(license_id);
CREATE INDEX IF NOT EXISTS idx_pack_purchases_pack_id ON public.pack_purchases(pack_id);
CREATE INDEX IF NOT EXISTS idx_track_licenses_track_id ON public.track_licenses(track_id);

-- Remove unused indexes to improve write performance and reduce storage
DROP INDEX IF EXISTS public.idx_instant_payouts_artist_id;
DROP INDEX IF EXISTS public.idx_pack_purchases_user_id;
DROP INDEX IF EXISTS public.idx_track_licenses_artist_id;
DROP INDEX IF EXISTS public.idx_track_licenses_buyer_id;
