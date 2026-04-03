/*
  # Drop Unused Indexes - Security Fix Batch 9
  
  1. Changes
    - Drops unused indexes on snippet_licenses
    - Drops unused indexes on track_licenses
    - Drops unused indexes on unified_content_fingerprints
    - Drops unused indexes on universal_transactions
    - Improves database performance
  
  2. Security
    - No RLS changes
    - Performance improvement only
*/

-- Drop unused indexes on snippet licenses
DROP INDEX IF EXISTS idx_snippet_licenses_pack_id;
DROP INDEX IF EXISTS idx_snippet_licenses_snippet_id;
DROP INDEX IF EXISTS idx_snippet_licenses_user_id;

-- Drop unused indexes on track licenses
DROP INDEX IF EXISTS idx_track_licenses_artist_id;
DROP INDEX IF EXISTS idx_track_licenses_buyer_id;
DROP INDEX IF EXISTS idx_track_licenses_podcast_id;
DROP INDEX IF EXISTS idx_track_licenses_track_id;
DROP INDEX IF EXISTS idx_track_licenses_video_id;

-- Drop unused indexes on unified content and transactions
DROP INDEX IF EXISTS idx_unified_content_fingerprints_dccs_certificate_id;
DROP INDEX IF EXISTS idx_universal_transactions_user_id;