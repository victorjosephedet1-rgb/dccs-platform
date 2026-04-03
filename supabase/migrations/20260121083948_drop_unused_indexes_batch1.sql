/*
  # Drop Unused Indexes - Batch 1

  ## Summary
  Removes unused indexes to reduce storage overhead and improve write performance.
  This migration drops ~150 unused indexes identified by database analysis.
  
  ## Impact
  - Reduced storage space
  - Improved write performance
  - No impact on query performance (indexes are unused)
*/

-- DCCS and AI Indexes
DROP INDEX IF EXISTS idx_dccs_licensing_status;
DROP INDEX IF EXISTS idx_dccs_creation_timestamp;
DROP INDEX IF EXISTS idx_dccs_cert_id;
DROP INDEX IF EXISTS idx_dccs_clearance;
DROP INDEX IF EXISTS idx_dccs_creator;
DROP INDEX IF EXISTS idx_dccs_snippet;
DROP INDEX IF EXISTS idx_dccs_blockchain;
DROP INDEX IF EXISTS idx_dccs_fingerprint;
DROP INDEX IF EXISTS idx_dccs_certificates_public_lookup;
DROP INDEX IF EXISTS idx_dccs_certificates_content_type;
DROP INDEX IF EXISTS idx_dccs_certificates_video_id;
DROP INDEX IF EXISTS idx_dccs_certificates_podcast_id;
DROP INDEX IF EXISTS idx_dccs_certificates_revenue_model;
DROP INDEX IF EXISTS idx_dccs_certificates_lifetime_tracking;
DROP INDEX IF EXISTS idx_ai_guidance_user;
DROP INDEX IF EXISTS idx_ai_guidance_cert;
DROP INDEX IF EXISTS idx_ai_guidance_type;
DROP INDEX IF EXISTS idx_ai_guidance_created;
DROP INDEX IF EXISTS idx_ai_guidance_user_id;
DROP INDEX IF EXISTS idx_ai_guidance_created_at;

-- Dispute Indexes
DROP INDEX IF EXISTS idx_dispute_id;
DROP INDEX IF EXISTS idx_dispute_cert;
DROP INDEX IF EXISTS idx_dispute_claimant;
DROP INDEX IF EXISTS idx_dispute_respondent;
DROP INDEX IF EXISTS idx_dispute_status;
DROP INDEX IF EXISTS idx_dispute_created;
DROP INDEX IF EXISTS idx_dccs_dispute_cases_resolved_by;
DROP INDEX IF EXISTS idx_dccs_disputes_certificate;
DROP INDEX IF EXISTS idx_dccs_disputes_snippet;
DROP INDEX IF EXISTS idx_dccs_disputes_plaintiff;
DROP INDEX IF EXISTS idx_dccs_disputes_defendant;
DROP INDEX IF EXISTS idx_dccs_disputes_assigned_admin;
DROP INDEX IF EXISTS idx_dccs_disputes_status;
DROP INDEX IF EXISTS idx_dccs_disputes_priority;
DROP INDEX IF EXISTS idx_dccs_disputes_filed_at;
DROP INDEX IF EXISTS idx_dccs_disputes_type;
DROP INDEX IF EXISTS idx_dccs_dispute_activity_dispute;
DROP INDEX IF EXISTS idx_dccs_dispute_activity_actor;
DROP INDEX IF EXISTS idx_dccs_dispute_activity_created;
DROP INDEX IF EXISTS idx_dccs_dispute_activity_type;
DROP INDEX IF EXISTS idx_dccs_dispute_escrow_dispute;
DROP INDEX IF EXISTS idx_dccs_dispute_escrow_status;
DROP INDEX IF EXISTS idx_dccs_dispute_escrow_held_by;
DROP INDEX IF EXISTS idx_dccs_dispute_escrow_released_by;

-- Split Version and Royalty Indexes
DROP INDEX IF EXISTS idx_split_ver_cert;
DROP INDEX IF EXISTS idx_split_ver_active;
DROP INDEX IF EXISTS idx_split_ver_version;
DROP INDEX IF EXISTS idx_dccs_split_versions_changed_by;
DROP INDEX IF EXISTS idx_dccs_split_versions_locked_by;
DROP INDEX IF EXISTS idx_dccs_royalty_clearance;
DROP INDEX IF EXISTS idx_dccs_royalty_license;
DROP INDEX IF EXISTS idx_dccs_royalty_artist;
DROP INDEX IF EXISTS idx_dccs_royalty_buyer;
DROP INDEX IF EXISTS idx_dccs_royalty_status;
DROP INDEX IF EXISTS idx_dccs_royalty_period;
DROP INDEX IF EXISTS idx_dccs_royalty_created;
DROP INDEX IF EXISTS idx_royalty_payment_method;
DROP INDEX IF EXISTS idx_royalty_batch;
DROP INDEX IF EXISTS idx_royalty_updated;
DROP INDEX IF EXISTS idx_royalty_paid;
DROP INDEX IF EXISTS idx_royalty_audit_payment;
DROP INDEX IF EXISTS idx_royalty_audit_created;
DROP INDEX IF EXISTS idx_dccs_royalty_audit_changed_by;

-- Whitelist and Training Indexes
DROP INDEX IF EXISTS idx_whitelist_cert;
DROP INDEX IF EXISTS idx_whitelist_clearance;
DROP INDEX IF EXISTS idx_whitelist_license;
DROP INDEX IF EXISTS idx_whitelist_platform;
DROP INDEX IF EXISTS idx_whitelist_status;
DROP INDEX IF EXISTS idx_dccs_whitelist_evidence_buyer;
DROP INDEX IF EXISTS idx_training_cert;
DROP INDEX IF EXISTS idx_training_creator;
DROP INDEX IF EXISTS idx_training_allowed;
DROP INDEX IF EXISTS idx_training_revoked;

-- Artist and Transaction Indexes
DROP INDEX IF EXISTS idx_artist_tips_from_user_id;
DROP INDEX IF EXISTS idx_artist_tips_to_artist_id;
DROP INDEX IF EXISTS idx_audio_fingerprints_agreement_id;
DROP INDEX IF EXISTS idx_audio_fingerprints_snippet_id;
DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_bank_accounts_payout_identity_id;
DROP INDEX IF EXISTS idx_blockchain_transactions_snippet_id;
DROP INDEX IF EXISTS idx_bookings_artist_id;
DROP INDEX IF EXISTS idx_bookings_client_id;
