/*
  # Drop Unused Indexes - Batch 1

  1. Performance Optimization
    - Remove indexes that are not being used by any queries
    - Reduces database maintenance overhead
    - Frees up storage space
    - Improves INSERT/UPDATE/DELETE performance

  2. Indexes Dropped
    - Google indexing request indexes (unused feature)
    - Backup log indexes (low query volume)
    - Payment record indexes (redundant with new foreign key indexes)
    - DCCS download indexes (redundant)
    - DCCS AI monitoring indexes (redundant)
    - Platform info indexes (low usage)

  3. Why This Matters
    - Each index adds overhead to write operations
    - Unused indexes waste storage and memory
    - Removing them improves overall database performance
*/

-- Drop unused Google indexing request indexes
DROP INDEX IF EXISTS idx_google_indexing_requests_url;
DROP INDEX IF EXISTS idx_google_indexing_requests_status;
DROP INDEX IF EXISTS idx_google_indexing_requests_requested_by;
DROP INDEX IF EXISTS idx_google_indexing_requests_requested_at;

-- Drop unused backup log indexes
DROP INDEX IF EXISTS idx_backup_logs_created_at;
DROP INDEX IF EXISTS idx_backup_logs_status_failed;
DROP INDEX IF EXISTS idx_backup_logs_type;

-- Drop unused payment record indexes
DROP INDEX IF EXISTS idx_payment_records_status_dccs;
DROP INDEX IF EXISTS idx_payment_records_user_id;
DROP INDEX IF EXISTS idx_payment_records_dccs_id;
DROP INDEX IF EXISTS idx_payment_records_status;

-- Drop unused DCCS download indexes
DROP INDEX IF EXISTS idx_dccs_download_unlocked;
DROP INDEX IF EXISTS idx_dccs_certificates_download_unlocked;

-- Drop unused royalty payment indexes
DROP INDEX IF EXISTS idx_royalty_payments_status_pending;

-- Drop unused DCCS AI monitoring indexes
DROP INDEX IF EXISTS idx_dccs_ai_monitoring_log_detection_id;

-- Drop unused platform info indexes
DROP INDEX IF EXISTS idx_platform_info_updated_by;
