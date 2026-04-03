/*
  # Add Foreign Key Indexes - Batch 8 (Notifications, OTP, Packs, Platform)

  1. Performance Improvements
    - Add indexes for notification, pack, and platform usage tables
    - Critical for user notifications and pack purchases

  2. Tables Covered
    - notifications
    - otp_attempts
    - pack_assets
    - pack_purchases
    - platform_revenue
    - platform_usage_detection
    - platform_usage_tracking
    - platform_violations
*/

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
  ON notifications(user_id);

-- otp_attempts
CREATE INDEX IF NOT EXISTS idx_otp_attempts_user_id 
  ON otp_attempts(user_id);

-- pack_assets
CREATE INDEX IF NOT EXISTS idx_pack_assets_snippet_id 
  ON pack_assets(snippet_id);

-- pack_purchases
CREATE INDEX IF NOT EXISTS idx_pack_purchases_pack_id 
  ON pack_purchases(pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_purchases_user_id 
  ON pack_purchases(user_id);

-- platform_revenue
CREATE INDEX IF NOT EXISTS idx_platform_revenue_artist_id 
  ON platform_revenue(artist_id);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_detection_id 
  ON platform_revenue(detection_id);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_license_id 
  ON platform_revenue(license_id);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_payout_id 
  ON platform_revenue(payout_id);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_snippet_id 
  ON platform_revenue(snippet_id);

-- platform_usage_detection
CREATE INDEX IF NOT EXISTS idx_platform_usage_detection_fingerprint_id 
  ON platform_usage_detection(fingerprint_id);
CREATE INDEX IF NOT EXISTS idx_platform_usage_detection_snippet_id 
  ON platform_usage_detection(snippet_id);

-- platform_usage_tracking
CREATE INDEX IF NOT EXISTS idx_platform_usage_tracking_license_id 
  ON platform_usage_tracking(license_id);

-- platform_violations
CREATE INDEX IF NOT EXISTS idx_platform_violations_user_id 
  ON platform_violations(user_id);
