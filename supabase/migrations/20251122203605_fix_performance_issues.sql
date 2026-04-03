/*
  # Fix Performance Issues

  1. Performance Improvements
    - Add missing indexes on foreign keys:
      - `instant_payouts.license_id` - for payout lookups by license
      - `pack_purchases.pack_id` - for purchase lookups by pack
      - `track_licenses.track_id` - for license lookups by track
    
  2. Index Optimization
    - Remove unused indexes that were flagged:
      - `idx_instant_payouts_artist_id` (covered by foreign key index)
      - `idx_pack_purchases_user_id` (covered by foreign key index)
      - `idx_track_licenses_artist_id` (covered by foreign key index)
      - `idx_track_licenses_buyer_id` (covered by foreign key index)

  Notes:
  - Foreign key indexes improve JOIN performance significantly
  - Removing unused indexes reduces write overhead and storage
  - These changes optimize both read and write operations
*/

-- Add missing indexes on foreign keys for optimal query performance
CREATE INDEX IF NOT EXISTS idx_instant_payouts_license_id 
  ON instant_payouts(license_id);

CREATE INDEX IF NOT EXISTS idx_pack_purchases_pack_id 
  ON pack_purchases(pack_id);

CREATE INDEX IF NOT EXISTS idx_track_licenses_track_id 
  ON track_licenses(track_id);

-- Remove unused indexes to reduce write overhead
DROP INDEX IF EXISTS idx_instant_payouts_artist_id;
DROP INDEX IF EXISTS idx_pack_purchases_user_id;
DROP INDEX IF EXISTS idx_track_licenses_artist_id;
DROP INDEX IF EXISTS idx_track_licenses_buyer_id;