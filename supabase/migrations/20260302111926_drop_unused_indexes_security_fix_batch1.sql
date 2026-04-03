/*
  # Drop Unused Indexes - Security Fix Batch 1
  
  1. Changes
    - Drops unused indexes on dccs_dispute_* tables
    - Drops unused indexes on dccs_download_history, dccs_registrations
    - Drops unused indexes on dccs_royalty_* tables
    - Improves database performance by removing unnecessary indexes
  
  2. Security
    - No RLS changes
    - Performance improvement only
*/

-- Drop unused indexes on dispute tables
DROP INDEX IF EXISTS idx_dccs_dispute_activity_logs_actor_id;
DROP INDEX IF EXISTS idx_dccs_dispute_activity_logs_dispute_id;
DROP INDEX IF EXISTS idx_dccs_dispute_cases_certificate_id;
DROP INDEX IF EXISTS idx_dccs_dispute_cases_claimant_id;
DROP INDEX IF EXISTS idx_dccs_dispute_cases_resolved_by;
DROP INDEX IF EXISTS idx_dccs_dispute_cases_respondent_id;
DROP INDEX IF EXISTS idx_dccs_dispute_escrow_dispute_id;
DROP INDEX IF EXISTS idx_dccs_dispute_escrow_held_by_admin_id;
DROP INDEX IF EXISTS idx_dccs_dispute_escrow_released_by_admin_id;
DROP INDEX IF EXISTS idx_dccs_disputes_assigned_admin_id;
DROP INDEX IF EXISTS idx_dccs_disputes_certificate_id;
DROP INDEX IF EXISTS idx_dccs_disputes_defendant_id;
DROP INDEX IF EXISTS idx_dccs_disputes_plaintiff_id;
DROP INDEX IF EXISTS idx_dccs_disputes_snippet_id;

-- Drop unused indexes on download and registration tables
DROP INDEX IF EXISTS idx_dccs_platform_detections_dccs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_download_history_upload_id;
DROP INDEX IF EXISTS idx_dccs_download_history_user_id;
DROP INDEX IF EXISTS idx_dccs_registrations_dccs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_registrations_upload_id;
DROP INDEX IF EXISTS idx_dccs_registrations_user_id;

-- Drop unused indexes on royalty tables
DROP INDEX IF EXISTS idx_dccs_royalty_collections_claim_id;
DROP INDEX IF EXISTS idx_dccs_royalty_collections_dccs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_royalty_payment_audit_changed_by;
DROP INDEX IF EXISTS idx_dccs_royalty_payment_audit_payment_id;
DROP INDEX IF EXISTS idx_dccs_royalty_payments_artist_id;
DROP INDEX IF EXISTS idx_dccs_royalty_payments_buyer_id;
DROP INDEX IF EXISTS idx_dccs_royalty_payments_license_id;