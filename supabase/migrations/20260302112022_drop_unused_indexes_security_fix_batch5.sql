/*
  # Drop Unused Indexes - Security Fix Batch 5
  
  1. Changes
    - Drops unused indexes on platform_revenue, platform_usage tables
    - Drops unused indexes on platform_violations, royalty_audit_log
    - Drops unused indexes on royalty_payments, content_fingerprints
    - Improves database performance
  
  2. Security
    - No RLS changes
    - Performance improvement only
*/

-- Drop unused indexes on platform revenue and usage tables
DROP INDEX IF EXISTS idx_platform_revenue_artist_id;
DROP INDEX IF EXISTS idx_platform_revenue_detection_id;
DROP INDEX IF EXISTS idx_platform_revenue_license_id;
DROP INDEX IF EXISTS idx_platform_revenue_payout_id;
DROP INDEX IF EXISTS idx_platform_revenue_snippet_id;
DROP INDEX IF EXISTS idx_platform_usage_detection_fingerprint_id;
DROP INDEX IF EXISTS idx_platform_usage_detection_snippet_id;
DROP INDEX IF EXISTS idx_platform_usage_tracking_license_id;

-- Drop unused indexes on violation and audit tables
DROP INDEX IF EXISTS idx_platform_violations_user_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_snippet_id;
DROP INDEX IF EXISTS idx_royalty_payments_recipient_id;
DROP INDEX IF EXISTS idx_royalty_payments_split_id;

-- Drop unused indexes on content fingerprints
DROP INDEX IF EXISTS idx_content_fingerprints_license_id;
DROP INDEX IF EXISTS idx_content_fingerprints_podcast_id;
DROP INDEX IF EXISTS idx_content_fingerprints_track_id;
DROP INDEX IF EXISTS idx_content_fingerprints_video_id;