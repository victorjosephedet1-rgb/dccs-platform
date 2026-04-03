/*
  # Drop Unused Indexes - Batch 5

  1. Performance Optimization
    - Remove unused indexes from dccs_copyright_claims through dccs_disputes
    - Reduces overhead on DCCS dispute and claims tables

  2. Indexes Removed
    - dccs_copyright_claims (2 indexes)
    - dccs_dispute_activity_logs (2 indexes)
    - dccs_dispute_cases (4 indexes)
    - dccs_dispute_escrow (3 indexes)
    - dccs_disputes (5 indexes)
*/

-- dccs_copyright_claims
DROP INDEX IF EXISTS idx_dccs_copyright_claims_dccs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_copyright_claims_detection_id;

-- dccs_dispute_activity_logs
DROP INDEX IF EXISTS idx_dccs_dispute_activity_logs_actor_id;
DROP INDEX IF EXISTS idx_dccs_dispute_activity_logs_dispute_id;

-- dccs_dispute_cases
DROP INDEX IF EXISTS idx_dccs_dispute_cases_certificate_id;
DROP INDEX IF EXISTS idx_dccs_dispute_cases_claimant_id;
DROP INDEX IF EXISTS idx_dccs_dispute_cases_resolved_by;
DROP INDEX IF EXISTS idx_dccs_dispute_cases_respondent_id;

-- dccs_dispute_escrow
DROP INDEX IF EXISTS idx_dccs_dispute_escrow_dispute_id;
DROP INDEX IF EXISTS idx_dccs_dispute_escrow_held_by_admin_id;
DROP INDEX IF EXISTS idx_dccs_dispute_escrow_released_by_admin_id;

-- dccs_disputes
DROP INDEX IF EXISTS idx_dccs_disputes_assigned_admin_id;
DROP INDEX IF EXISTS idx_dccs_disputes_certificate_id;
DROP INDEX IF EXISTS idx_dccs_disputes_defendant_id;
DROP INDEX IF EXISTS idx_dccs_disputes_plaintiff_id;
DROP INDEX IF EXISTS idx_dccs_disputes_snippet_id;
