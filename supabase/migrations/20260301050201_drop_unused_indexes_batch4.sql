/*
  # Drop Unused Indexes - Batch 4
  
  1. Performance Improvements
    - Continue removing unused indexes
  
  2. Indexes Dropped (Batch 4 - 30 indexes)
*/

DROP INDEX IF EXISTS idx_dccs_dispute_activity_logs_actor_id;
DROP INDEX IF EXISTS idx_dccs_dispute_activity_logs_dispute_id;
DROP INDEX IF EXISTS idx_dccs_dispute_cases_certificate_id;
DROP INDEX IF EXISTS idx_dccs_dispute_cases_claimant_id;
DROP INDEX IF EXISTS idx_dccs_dispute_escrow_dispute_id;
DROP INDEX IF EXISTS idx_dccs_dispute_escrow_held_by_admin_id;
DROP INDEX IF EXISTS idx_dccs_dispute_escrow_released_by_admin_id;
DROP INDEX IF EXISTS idx_dccs_disputes_assigned_admin_id;
DROP INDEX IF EXISTS idx_dccs_disputes_certificate_id;
DROP INDEX IF EXISTS idx_dccs_disputes_defendant_id;
DROP INDEX IF EXISTS idx_dccs_disputes_plaintiff_id;
DROP INDEX IF EXISTS idx_dccs_disputes_snippet_id;
DROP INDEX IF EXISTS idx_dccs_certificates_phase_lookup;
DROP INDEX IF EXISTS idx_dccs_download_history_upload_id;
DROP INDEX IF EXISTS idx_dccs_download_history_user_id;
DROP INDEX IF EXISTS idx_dccs_platform_detections_dccs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_royalty_collections_claim_id;
DROP INDEX IF EXISTS idx_dccs_royalty_collections_dccs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_royalty_payment_audit_changed_by;
DROP INDEX IF EXISTS idx_dccs_royalty_payment_audit_payment_id;
DROP INDEX IF EXISTS idx_dccs_royalty_payments_artist_id;
DROP INDEX IF EXISTS idx_dccs_royalty_payments_buyer_id;
DROP INDEX IF EXISTS idx_dccs_royalty_payments_license_id;
DROP INDEX IF EXISTS idx_dccs_whitelist_evidence_license_id;
DROP INDEX IF EXISTS idx_uploads_purpose_lookup;
DROP INDEX IF EXISTS idx_uploads_marketplace_eligible;
DROP INDEX IF EXISTS idx_dccs_split_versions_changed_by;
DROP INDEX IF EXISTS idx_dccs_split_versions_locked_by;
DROP INDEX IF EXISTS idx_dccs_verification_logs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_whitelist_evidence_buyer_id;