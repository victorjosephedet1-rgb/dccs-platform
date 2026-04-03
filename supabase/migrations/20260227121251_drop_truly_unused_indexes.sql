/*
  # Drop Truly Unused Indexes

  1. Performance Optimization
    - Remove indexes that are not needed for foreign key constraints
    - These were added earlier but are not actually being used

  2. Indexes Removed
    - google_indexing_requests
    - payment_records (2 indexes)
    - platform_info

  3. Impact
    - Reduces write overhead
    - Frees storage space
    - All necessary foreign key indexes remain in place
*/

-- google_indexing_requests
DROP INDEX IF EXISTS idx_google_indexing_requests_requested_by;

-- payment_records
DROP INDEX IF EXISTS idx_payment_records_dccs_id;
DROP INDEX IF EXISTS idx_payment_records_user_id;

-- platform_info
DROP INDEX IF EXISTS idx_platform_info_updated_by;
