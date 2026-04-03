/*
  # Drop Unused Indexes - Security Fix Batch 3
  
  1. Changes
    - Drops unused indexes on gdpr_requests, instant_logins, instant_payouts
    - Drops unused indexes on legal_agreements, licensing_terms
    - Drops unused indexes on customer_instances, dccs_ai_monitoring
    - Drops unused indexes on deployment_versions, google_indexing
    - Improves database performance
  
  2. Security
    - No RLS changes
    - Performance improvement only
*/

-- Drop unused indexes on gdpr and instant tables
DROP INDEX IF EXISTS idx_gdpr_requests_processed_by;
DROP INDEX IF EXISTS idx_gdpr_requests_user_id;
DROP INDEX IF EXISTS idx_instant_logins_user_id;
DROP INDEX IF EXISTS idx_instant_payouts_artist_id;
DROP INDEX IF EXISTS idx_instant_payouts_license_id;

-- Drop unused indexes on legal and licensing tables
DROP INDEX IF EXISTS idx_legal_agreements_created_by;
DROP INDEX IF EXISTS idx_licensing_terms_buyer_id;
DROP INDEX IF EXISTS idx_licensing_terms_license_agreement_id;
DROP INDEX IF EXISTS idx_licensing_terms_snippet_id;

-- Drop unused indexes on customer and deployment tables
DROP INDEX IF EXISTS idx_customer_instances_current_version_id;
DROP INDEX IF EXISTS idx_dccs_ai_monitoring_log_detection_id;
DROP INDEX IF EXISTS idx_deployment_versions_deployed_by;
DROP INDEX IF EXISTS idx_google_indexing_requests_requested_by;

-- Drop unused indexes on payment and platform tables
DROP INDEX IF EXISTS idx_payment_records_dccs_id;
DROP INDEX IF EXISTS idx_payment_records_user_id;
DROP INDEX IF EXISTS idx_platform_info_updated_by;