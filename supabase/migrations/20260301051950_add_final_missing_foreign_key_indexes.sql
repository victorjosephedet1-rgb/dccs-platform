/*
  # Add Final Missing Foreign Key Indexes
  
  1. Performance Improvements
    - Add the remaining 7 unindexed foreign keys
  
  2. Tables Covered
    - customer_instances
    - dccs_ai_monitoring_log
    - deployment_versions
    - google_indexing_requests
    - payment_records (2 indexes)
    - platform_info
*/

CREATE INDEX IF NOT EXISTS idx_customer_instances_current_version_id 
  ON customer_instances(current_version_id);

CREATE INDEX IF NOT EXISTS idx_dccs_ai_monitoring_log_detection_id 
  ON dccs_ai_monitoring_log(detection_id);

CREATE INDEX IF NOT EXISTS idx_deployment_versions_deployed_by 
  ON deployment_versions(deployed_by);

CREATE INDEX IF NOT EXISTS idx_google_indexing_requests_requested_by 
  ON google_indexing_requests(requested_by);

CREATE INDEX IF NOT EXISTS idx_payment_records_dccs_id 
  ON payment_records(dccs_id);

CREATE INDEX IF NOT EXISTS idx_payment_records_user_id 
  ON payment_records(user_id);

CREATE INDEX IF NOT EXISTS idx_platform_info_updated_by 
  ON platform_info(updated_by);