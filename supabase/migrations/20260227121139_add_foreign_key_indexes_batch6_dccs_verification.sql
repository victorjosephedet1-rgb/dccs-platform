/*
  # Add Foreign Key Indexes - Batch 6 (DCCS Verification and Whitelist)

  1. Performance Improvements
    - Add indexes for remaining DCCS tables
    - Critical for split management and content verification

  2. Tables Covered
    - dccs_split_versions
    - dccs_verification_logs
    - dccs_whitelist_evidence
*/

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
