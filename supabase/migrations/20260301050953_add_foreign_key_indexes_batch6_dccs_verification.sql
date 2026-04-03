/*
  # Add Foreign Key Indexes - Batch 6 (DCCS Verification and Other)
  
  1. Performance Improvements
    - Add indexes for unindexed foreign keys
  
  2. Tables Covered
    - dccs_split_versions
    - dccs_verification_logs
    - dccs_verification_requests
    - dccs_whitelist_evidence
*/

CREATE INDEX IF NOT EXISTS idx_dccs_split_versions_changed_by 
  ON dccs_split_versions(changed_by);

CREATE INDEX IF NOT EXISTS idx_dccs_split_versions_locked_by 
  ON dccs_split_versions(locked_by);

CREATE INDEX IF NOT EXISTS idx_dccs_verification_logs_certificate_id 
  ON dccs_verification_logs(certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_verification_requests_certificate_id 
  ON dccs_verification_requests(certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_verification_requests_requested_by_user_id 
  ON dccs_verification_requests(requested_by_user_id);

CREATE INDEX IF NOT EXISTS idx_dccs_whitelist_evidence_buyer_id 
  ON dccs_whitelist_evidence(buyer_id);

CREATE INDEX IF NOT EXISTS idx_dccs_whitelist_evidence_certificate_id 
  ON dccs_whitelist_evidence(certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_whitelist_evidence_license_id 
  ON dccs_whitelist_evidence(license_id);