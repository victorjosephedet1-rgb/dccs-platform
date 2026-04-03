/*
  # Drop Unused Indexes - Batch 1
  
  1. Performance Improvements
    - Remove indexes that are not being used by queries
    - Reduces storage overhead
    - Improves write performance (no index maintenance)
  
  2. Indexes Dropped (Batch 1 - 30 indexes)
    - Various unused indexes across multiple tables
*/

-- Drop unused indexes - Batch 1
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_otp_attempts_user_id;
DROP INDEX IF EXISTS idx_pack_assets_snippet_id;
DROP INDEX IF EXISTS idx_pack_purchases_pack_id;
DROP INDEX IF EXISTS idx_pack_purchases_user_id;
DROP INDEX IF EXISTS idx_platform_revenue_artist_id;
DROP INDEX IF EXISTS idx_platform_revenue_detection_id;
DROP INDEX IF EXISTS idx_platform_revenue_license_id;
DROP INDEX IF EXISTS idx_platform_revenue_payout_id;
DROP INDEX IF EXISTS idx_platform_revenue_snippet_id;
DROP INDEX IF EXISTS idx_platform_usage_detection_fingerprint_id;
DROP INDEX IF EXISTS idx_platform_usage_detection_snippet_id;
DROP INDEX IF EXISTS idx_platform_usage_tracking_license_id;
DROP INDEX IF EXISTS idx_platform_violations_user_id;
DROP INDEX IF EXISTS idx_podcast_content_creator_id;
DROP INDEX IF EXISTS idx_premium_subscriptions_artist_id;
DROP INDEX IF EXISTS idx_premium_subscriptions_subscriber_id;
DROP INDEX IF EXISTS idx_project_collaborators_user_id;
DROP INDEX IF EXISTS idx_projects_user_id;
DROP INDEX IF EXISTS idx_royalty_agreements_artist_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_artist_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_license_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_payout_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_snippet_id;
DROP INDEX IF EXISTS idx_royalty_payments_recipient_id;
DROP INDEX IF EXISTS idx_royalty_payments_split_id;
DROP INDEX IF EXISTS idx_royalty_splits_booking_id;
DROP INDEX IF EXISTS idx_snippet_licenses_pack_id;
DROP INDEX IF EXISTS idx_snippet_licenses_snippet_id;
DROP INDEX IF EXISTS idx_snippet_licenses_user_id;