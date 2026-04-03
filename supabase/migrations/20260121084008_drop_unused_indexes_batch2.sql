/*
  # Drop Unused Indexes - Batch 2

  ## Summary
  Continues removing unused indexes for storage and performance optimization.
  
  ## Impact
  - Reduced storage space
  - Improved write performance
  - No impact on query performance (indexes are unused)
*/

-- Content Fingerprints and Moderation Indexes
DROP INDEX IF EXISTS idx_content_fingerprints_license_id;
DROP INDEX IF EXISTS idx_content_fingerprints_track_id;
DROP INDEX IF EXISTS idx_content_fingerprints_content_type;
DROP INDEX IF EXISTS idx_content_fingerprints_video_id;
DROP INDEX IF EXISTS idx_content_fingerprints_podcast_id;
DROP INDEX IF EXISTS idx_content_moderation_flags_reviewed_by;
DROP INDEX IF EXISTS idx_content_moderation_flags_snippet_id;

-- Copyright and DMCA Indexes
DROP INDEX IF EXISTS idx_copyright_claims_claimant_id;
DROP INDEX IF EXISTS idx_copyright_claims_resolved_by;
DROP INDEX IF EXISTS idx_copyright_claims_respondent_id;
DROP INDEX IF EXISTS idx_copyright_claims_snippet_id;
DROP INDEX IF EXISTS idx_dmca_notices_reviewed_by;
DROP INDEX IF EXISTS idx_dmca_notices_snippet_id;

-- Events and GDPR Indexes
DROP INDEX IF EXISTS idx_event_tickets_artist_id;
DROP INDEX IF EXISTS idx_event_tickets_buyer_id;
DROP INDEX IF EXISTS idx_gdpr_requests_processed_by;
DROP INDEX IF EXISTS idx_gdpr_requests_user_id;

-- Payouts and Legal Indexes
DROP INDEX IF EXISTS idx_instant_payouts_artist_id;
DROP INDEX IF EXISTS idx_instant_payouts_license_id;
DROP INDEX IF EXISTS idx_legal_agreements_created_by;

-- Licensing Indexes
DROP INDEX IF EXISTS idx_licensing_terms_buyer_id;
DROP INDEX IF EXISTS idx_licensing_terms_license_agreement_id;
DROP INDEX IF EXISTS idx_licensing_terms_snippet_id;

-- Notifications and Packs Indexes
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_pack_purchases_pack_id;
DROP INDEX IF EXISTS idx_pack_purchases_user_id;

-- Platform Revenue Indexes
DROP INDEX IF EXISTS idx_platform_revenue_artist_id;
DROP INDEX IF EXISTS idx_platform_revenue_detection_id;
DROP INDEX IF EXISTS idx_platform_revenue_license_id;
DROP INDEX IF EXISTS idx_platform_revenue_payout_id;
DROP INDEX IF EXISTS idx_platform_revenue_snippet_id;

-- Platform Usage Indexes
DROP INDEX IF EXISTS idx_platform_usage_detection_fingerprint_id;
DROP INDEX IF EXISTS idx_platform_usage_detection_snippet_id;
DROP INDEX IF EXISTS idx_platform_usage_tracking_license_id;

-- Premium Subscriptions Indexes
DROP INDEX IF EXISTS idx_premium_subscriptions_artist_id;
DROP INDEX IF EXISTS idx_premium_subscriptions_subscriber_id;

-- Royalty Indexes
DROP INDEX IF EXISTS idx_royalty_agreements_artist_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_artist_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_license_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_payout_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_snippet_id;
DROP INDEX IF EXISTS idx_royalty_payments_recipient_id;
DROP INDEX IF EXISTS idx_royalty_payments_split_id;
DROP INDEX IF EXISTS idx_royalty_splits_booking_id;

-- Track Licenses Indexes
DROP INDEX IF EXISTS idx_track_licenses_artist_id;
DROP INDEX IF EXISTS idx_track_licenses_buyer_id;
DROP INDEX IF EXISTS idx_track_licenses_track_id;
DROP INDEX IF EXISTS idx_track_licenses_content_type;
DROP INDEX IF EXISTS idx_track_licenses_video_id;
DROP INDEX IF EXISTS idx_track_licenses_podcast_id;

-- Transactions and Verification Indexes
DROP INDEX IF EXISTS idx_universal_transactions_user_id;
DROP INDEX IF EXISTS idx_upload_verification_artist_id;
DROP INDEX IF EXISTS idx_upload_verification_snippet_id;
DROP INDEX IF EXISTS idx_user_agreement_acceptances_agreement_id;
