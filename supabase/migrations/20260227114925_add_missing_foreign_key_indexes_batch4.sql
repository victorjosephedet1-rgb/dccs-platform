/*
  # Add Missing Foreign Key Indexes - Batch 4

  1. Performance Improvements
    - Add indexes for foreign keys in dccs_platform_detections
    - Add indexes for foreign keys in dccs_royalty_collections
    - Add indexes for foreign keys in dccs_royalty_payment_audit
    - Add indexes for foreign keys in dccs_royalty_payments
    - Add indexes for foreign keys in dccs_split_versions
    - Add indexes for foreign keys in dccs_verification_logs
    - Add indexes for foreign keys in dccs_whitelist_evidence

  2. Why This Matters
    - Critical for royalty payment performance
    - Ensures fast audit log queries
*/

-- dccs_platform_detections
CREATE INDEX IF NOT EXISTS idx_dccs_platform_detections_dccs_certificate_id 
  ON dccs_platform_detections(dccs_certificate_id);

-- dccs_royalty_collections
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_collections_claim_id 
  ON dccs_royalty_collections(claim_id);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_collections_dccs_certificate_id 
  ON dccs_royalty_collections(dccs_certificate_id);

-- dccs_royalty_payment_audit
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payment_audit_changed_by 
  ON dccs_royalty_payment_audit(changed_by);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payment_audit_payment_id 
  ON dccs_royalty_payment_audit(payment_id);

-- dccs_royalty_payments
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payments_artist_id 
  ON dccs_royalty_payments(artist_id);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payments_buyer_id 
  ON dccs_royalty_payments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payments_license_id 
  ON dccs_royalty_payments(license_id);

-- dccs_split_versions
CREATE INDEX IF NOT EXISTS idx_dccs_split_versions_changed_by 
  ON dccs_split_versions(changed_by);
CREATE INDEX IF NOT EXISTS idx_dccs_split_versions_locked_by 
  ON dccs_split_versions(locked_by);

-- dccs_verification_logs
CREATE INDEX IF NOT EXISTS idx_dccs_verification_logs_certificate_id 
  ON dccs_verification_logs(certificate_id);

-- dccs_whitelist_evidence
CREATE INDEX IF NOT EXISTS idx_dccs_whitelist_evidence_buyer_id 
  ON dccs_whitelist_evidence(buyer_id);
CREATE INDEX IF NOT EXISTS idx_dccs_whitelist_evidence_certificate_id 
  ON dccs_whitelist_evidence(certificate_id);
CREATE INDEX IF NOT EXISTS idx_dccs_whitelist_evidence_license_id 
  ON dccs_whitelist_evidence(license_id);
