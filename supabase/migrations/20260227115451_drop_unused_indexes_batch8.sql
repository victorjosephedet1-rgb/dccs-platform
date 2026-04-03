/*
  # Drop Unused Indexes - Batch 8

  1. Performance Optimization
    - Remove unused indexes from notifications through platform_violations
    - Optimizes notification, pack, and platform usage tables

  2. Indexes Removed
    - notifications (1 index)
    - otp_attempts (1 index)
    - pack_assets (1 index)
    - pack_purchases (2 indexes)
    - platform_revenue (5 indexes)
    - platform_usage_detection (2 indexes)
    - platform_usage_tracking (1 index)
    - platform_violations (1 index)
*/

-- notifications
DROP INDEX IF EXISTS idx_notifications_user_id;

-- otp_attempts
DROP INDEX IF EXISTS idx_otp_attempts_user_id;

-- pack_assets
DROP INDEX IF EXISTS idx_pack_assets_snippet_id;

-- pack_purchases
DROP INDEX IF EXISTS idx_pack_purchases_pack_id;
DROP INDEX IF EXISTS idx_pack_purchases_user_id;

-- platform_revenue
DROP INDEX IF EXISTS idx_platform_revenue_artist_id;
DROP INDEX IF EXISTS idx_platform_revenue_detection_id;
DROP INDEX IF EXISTS idx_platform_revenue_license_id;
DROP INDEX IF EXISTS idx_platform_revenue_payout_id;
DROP INDEX IF EXISTS idx_platform_revenue_snippet_id;

-- platform_usage_detection
DROP INDEX IF EXISTS idx_platform_usage_detection_fingerprint_id;
DROP INDEX IF EXISTS idx_platform_usage_detection_snippet_id;

-- platform_usage_tracking
DROP INDEX IF EXISTS idx_platform_usage_tracking_license_id;

-- platform_violations
DROP INDEX IF EXISTS idx_platform_violations_user_id;
