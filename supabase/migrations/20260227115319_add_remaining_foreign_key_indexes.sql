/*
  # Add Remaining Foreign Key Indexes

  1. Performance Improvements
    - Add indexes for missing foreign keys identified in latest scan
    - Covers dccs_ai_monitoring_log, google_indexing_requests, payment_records, platform_info

  2. Why This Matters
    - Ensures all foreign key relationships have covering indexes
    - Prevents full table scans during JOIN operations
    - Critical for query performance
*/

-- dccs_ai_monitoring_log
CREATE INDEX IF NOT EXISTS idx_dccs_ai_monitoring_log_detection_id 
  ON dccs_ai_monitoring_log(detection_id);

-- google_indexing_requests
CREATE INDEX IF NOT EXISTS idx_google_indexing_requests_requested_by 
  ON google_indexing_requests(requested_by);

-- payment_records
CREATE INDEX IF NOT EXISTS idx_payment_records_dccs_id 
  ON payment_records(dccs_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id 
  ON payment_records(user_id);

-- platform_info
CREATE INDEX IF NOT EXISTS idx_platform_info_updated_by 
  ON platform_info(updated_by);
