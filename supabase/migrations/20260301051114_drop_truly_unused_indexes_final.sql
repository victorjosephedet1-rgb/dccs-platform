/*
  # Drop Unused Indexes - Final Cleanup
  
  1. Performance Improvements
    - Remove indexes that Supabase reports as unused
    - Reduces storage overhead and write performance impact
  
  2. Indexes Dropped
    - Only the 7 indexes that were just created but are not being used
*/

-- Drop only the indexes that Supabase specifically reports as unused
DROP INDEX IF EXISTS idx_customer_instances_current_version_id;
DROP INDEX IF EXISTS idx_dccs_ai_monitoring_log_detection_id;
DROP INDEX IF EXISTS idx_deployment_versions_deployed_by;
DROP INDEX IF EXISTS idx_google_indexing_requests_requested_by;
DROP INDEX IF EXISTS idx_payment_records_dccs_id;
DROP INDEX IF EXISTS idx_payment_records_user_id;
DROP INDEX IF EXISTS idx_platform_info_updated_by;