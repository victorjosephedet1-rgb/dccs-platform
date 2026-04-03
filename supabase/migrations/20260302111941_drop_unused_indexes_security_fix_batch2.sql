/*
  # Drop Unused Indexes - Security Fix Batch 2
  
  1. Changes
    - Drops unused indexes on dccs_split_versions, verification tables
    - Drops unused indexes on dccs_whitelist_evidence
    - Drops unused indexes on deployment_logs, dmca_notices
    - Drops unused indexes on event_tickets, exclusivity tables
    - Improves database performance
  
  2. Security
    - No RLS changes
    - Performance improvement only
*/

-- Drop unused indexes on verification and split tables
DROP INDEX IF EXISTS idx_dccs_split_versions_changed_by;
DROP INDEX IF EXISTS idx_dccs_split_versions_locked_by;
DROP INDEX IF EXISTS idx_dccs_verification_logs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_verification_requests_certificate_id;
DROP INDEX IF EXISTS idx_dccs_verification_requests_requested_by_user_id;

-- Drop unused indexes on whitelist evidence
DROP INDEX IF EXISTS idx_dccs_whitelist_evidence_buyer_id;
DROP INDEX IF EXISTS idx_dccs_whitelist_evidence_certificate_id;
DROP INDEX IF EXISTS idx_dccs_whitelist_evidence_license_id;

-- Drop unused indexes on deployment and dmca tables
DROP INDEX IF EXISTS idx_deployment_logs_customer_instance_id;
DROP INDEX IF EXISTS idx_deployment_logs_deployment_version_id;
DROP INDEX IF EXISTS idx_dmca_notices_reviewed_by;
DROP INDEX IF EXISTS idx_dmca_notices_snippet_id;

-- Drop unused indexes on event and exclusivity tables
DROP INDEX IF EXISTS idx_event_tickets_artist_id;
DROP INDEX IF EXISTS idx_event_tickets_buyer_id;
DROP INDEX IF EXISTS idx_exclusivity_declarations_snippet_id;
DROP INDEX IF EXISTS idx_exclusivity_declarations_user_id;
DROP INDEX IF EXISTS idx_exclusivity_violations_reported_by;
DROP INDEX IF EXISTS idx_exclusivity_violations_reviewed_by;
DROP INDEX IF EXISTS idx_exclusivity_violations_snippet_id;