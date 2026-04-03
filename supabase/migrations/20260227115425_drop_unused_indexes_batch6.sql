/*
  # Drop Unused Indexes - Batch 6

  1. Performance Optimization
    - Remove unused indexes from dccs_download_history through dccs_whitelist_evidence
    - Optimizes DCCS royalty and verification tables

  2. Indexes Removed
    - dccs_download_history (2 indexes)
    - dccs_platform_detections (1 index)
    - dccs_royalty_collections (2 indexes)
    - dccs_royalty_payment_audit (2 indexes)
    - dccs_royalty_payments (3 indexes)
    - dccs_split_versions (2 indexes)
    - dccs_verification_logs (1 index)
    - dccs_whitelist_evidence (3 indexes)
*/

-- dccs_download_history
DROP INDEX IF EXISTS idx_dccs_download_history_upload_id;
DROP INDEX IF EXISTS idx_dccs_download_history_user_id;

-- dccs_platform_detections
DROP INDEX IF EXISTS idx_dccs_platform_detections_dccs_certificate_id;

-- dccs_royalty_collections
DROP INDEX IF EXISTS idx_dccs_royalty_collections_claim_id;
DROP INDEX IF EXISTS idx_dccs_royalty_collections_dccs_certificate_id;

-- dccs_royalty_payment_audit
DROP INDEX IF EXISTS idx_dccs_royalty_payment_audit_changed_by;
DROP INDEX IF EXISTS idx_dccs_royalty_payment_audit_payment_id;

-- dccs_royalty_payments
DROP INDEX IF EXISTS idx_dccs_royalty_payments_artist_id;
DROP INDEX IF EXISTS idx_dccs_royalty_payments_buyer_id;
DROP INDEX IF EXISTS idx_dccs_royalty_payments_license_id;

-- dccs_split_versions
DROP INDEX IF EXISTS idx_dccs_split_versions_changed_by;
DROP INDEX IF EXISTS idx_dccs_split_versions_locked_by;

-- dccs_verification_logs
DROP INDEX IF EXISTS idx_dccs_verification_logs_certificate_id;

-- dccs_whitelist_evidence
DROP INDEX IF EXISTS idx_dccs_whitelist_evidence_buyer_id;
DROP INDEX IF EXISTS idx_dccs_whitelist_evidence_certificate_id;
DROP INDEX IF EXISTS idx_dccs_whitelist_evidence_license_id;
