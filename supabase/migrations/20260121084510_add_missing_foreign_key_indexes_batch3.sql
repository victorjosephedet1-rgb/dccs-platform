/*
  # Add Missing Foreign Key Indexes - Batch 3

  ## Summary
  Final batch of missing foreign key indexes.
  
  ## Batch 3: Remaining platform tables (35 indexes)
*/

-- Platform Usage Detection Indexes
CREATE INDEX IF NOT EXISTS idx_platform_usage_detection_fingerprint_id 
  ON platform_usage_detection(fingerprint_id);

CREATE INDEX IF NOT EXISTS idx_platform_usage_detection_snippet_id 
  ON platform_usage_detection(snippet_id);

-- Platform Usage Tracking Indexes
CREATE INDEX IF NOT EXISTS idx_platform_usage_tracking_license_id 
  ON platform_usage_tracking(license_id);

-- Platform Violations Indexes
CREATE INDEX IF NOT EXISTS idx_platform_violations_user_id 
  ON platform_violations(user_id);

-- Podcast Content Indexes
CREATE INDEX IF NOT EXISTS idx_podcast_content_creator_id 
  ON podcast_content(creator_id);

-- Premium Subscriptions Indexes
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_artist_id 
  ON premium_subscriptions(artist_id);

CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_subscriber_id 
  ON premium_subscriptions(subscriber_id);

-- Royalty Agreements Indexes
CREATE INDEX IF NOT EXISTS idx_royalty_agreements_artist_id 
  ON royalty_agreements(artist_id);

-- Royalty Audit Log Indexes
CREATE INDEX IF NOT EXISTS idx_royalty_audit_log_artist_id 
  ON royalty_audit_log(artist_id);

CREATE INDEX IF NOT EXISTS idx_royalty_audit_log_license_id 
  ON royalty_audit_log(license_id);

CREATE INDEX IF NOT EXISTS idx_royalty_audit_log_payout_id 
  ON royalty_audit_log(payout_id);

CREATE INDEX IF NOT EXISTS idx_royalty_audit_log_snippet_id 
  ON royalty_audit_log(snippet_id);

-- Royalty Payments Indexes
CREATE INDEX IF NOT EXISTS idx_royalty_payments_recipient_id 
  ON royalty_payments(recipient_id);

CREATE INDEX IF NOT EXISTS idx_royalty_payments_split_id 
  ON royalty_payments(split_id);

-- Royalty Splits Indexes
CREATE INDEX IF NOT EXISTS idx_royalty_splits_booking_id 
  ON royalty_splits(booking_id);

-- Track Licenses Indexes
CREATE INDEX IF NOT EXISTS idx_track_licenses_artist_id 
  ON track_licenses(artist_id);

CREATE INDEX IF NOT EXISTS idx_track_licenses_buyer_id 
  ON track_licenses(buyer_id);

CREATE INDEX IF NOT EXISTS idx_track_licenses_podcast_id 
  ON track_licenses(podcast_id);

CREATE INDEX IF NOT EXISTS idx_track_licenses_track_id 
  ON track_licenses(track_id);

CREATE INDEX IF NOT EXISTS idx_track_licenses_video_id 
  ON track_licenses(video_id);

-- Unified Content Fingerprints Indexes
CREATE INDEX IF NOT EXISTS idx_unified_content_fingerprints_dccs_certificate_id 
  ON unified_content_fingerprints(dccs_certificate_id);

-- Universal Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_universal_transactions_user_id 
  ON universal_transactions(user_id);

-- Upload Verification Indexes
CREATE INDEX IF NOT EXISTS idx_upload_verification_artist_id 
  ON upload_verification(artist_id);

CREATE INDEX IF NOT EXISTS idx_upload_verification_snippet_id 
  ON upload_verification(snippet_id);

-- User Agreement Acceptances Indexes
CREATE INDEX IF NOT EXISTS idx_user_agreement_acceptances_agreement_id 
  ON user_agreement_acceptances(agreement_id);

-- Video Content Indexes
CREATE INDEX IF NOT EXISTS idx_video_content_creator_id 
  ON video_content(creator_id);
