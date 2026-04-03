/*
  # Add Missing Foreign Key Indexes - Batch 8

  1. Performance Improvements
    - Add indexes for foreign keys in otp, pack, payment tables
    - Add indexes for foreign keys in platform tables

  2. Tables Affected
    - otp_attempts: user_id
    - pack_assets: snippet_id
    - pack_purchases: pack_id, user_id
    - payment_records: dccs_id, user_id
    - platform_info: updated_by
    - platform_revenue: artist_id, detection_id, license_id, payout_id, snippet_id
    - platform_usage_detection: fingerprint_id, snippet_id
    - platform_usage_tracking: license_id
    - platform_violations: user_id
*/

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

-- payment_records
CREATE INDEX IF NOT EXISTS idx_payment_records_dccs_id
ON payment_records(dccs_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_user_id
ON payment_records(user_id);

-- platform_info
CREATE INDEX IF NOT EXISTS idx_platform_info_updated_by
ON platform_info(updated_by);

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
