/*
  # Add Missing Foreign Key Indexes - Batch 5

  1. Performance Improvements
    - Add indexes for foreign keys in DCCS tables (platform_detections, registrations, royalty tables)
    - Add indexes for foreign keys in dccs_verification tables

  2. Tables Affected
    - dccs_platform_detections: dccs_certificate_id
    - dccs_registrations: dccs_certificate_id, upload_id, user_id
    - dccs_royalty_collections: claim_id, dccs_certificate_id
    - dccs_royalty_payment_audit: changed_by, payment_id
    - dccs_royalty_payments: artist_id, buyer_id, license_id
    - dccs_split_versions: changed_by, locked_by
    - dccs_verification_logs: certificate_id
    - dccs_verification_requests: certificate_id, requested_by_user_id
    - dccs_whitelist_evidence: buyer_id, certificate_id, license_id
*/

-- dccs_platform_detections
CREATE INDEX IF NOT EXISTS idx_dccs_platform_detections_dccs_certificate_id
ON dccs_platform_detections(dccs_certificate_id);

-- dccs_registrations
CREATE INDEX IF NOT EXISTS idx_dccs_registrations_dccs_certificate_id
ON dccs_registrations(dccs_certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_registrations_upload_id
ON dccs_registrations(upload_id);

CREATE INDEX IF NOT EXISTS idx_dccs_registrations_user_id
ON dccs_registrations(user_id);

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

-- dccs_verification_requests
CREATE INDEX IF NOT EXISTS idx_dccs_verification_requests_certificate_id
ON dccs_verification_requests(certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_verification_requests_requested_by_user_id
ON dccs_verification_requests(requested_by_user_id);

-- dccs_whitelist_evidence
CREATE INDEX IF NOT EXISTS idx_dccs_whitelist_evidence_buyer_id
ON dccs_whitelist_evidence(buyer_id);

CREATE INDEX IF NOT EXISTS idx_dccs_whitelist_evidence_certificate_id
ON dccs_whitelist_evidence(certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_whitelist_evidence_license_id
ON dccs_whitelist_evidence(license_id);
