/*
  # Add Missing Foreign Key Indexes - Batch 6

  1. Performance Improvements
    - Add indexes for foreign keys in notifications
    - Add indexes for foreign keys in otp_attempts
    - Add indexes for foreign keys in pack_assets
    - Add indexes for foreign keys in pack_purchases
    - Add indexes for foreign keys in platform_revenue
    - Add indexes for foreign keys in platform_usage_detection
    - Add indexes for foreign keys in platform_usage_tracking
    - Add indexes for foreign keys in platform_violations
    - Add indexes for foreign keys in podcast_content

  2. Why This Matters
    - Improves notification delivery performance
    - Optimizes pack purchase queries
    - Speeds up revenue tracking
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

-- podcast_content
CREATE INDEX IF NOT EXISTS idx_podcast_content_creator_id 
  ON podcast_content(creator_id);
