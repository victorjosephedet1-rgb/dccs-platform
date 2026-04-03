/*
  # Drop Unused Indexes - Batch 4

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 4: DCCS Dispute tables

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_dccs_dispute_activity_logs_actor_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_activity_logs_dispute_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_cases_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_cases_claimant_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_cases_resolved_by;
DROP INDEX IF EXISTS public.idx_dccs_dispute_cases_respondent_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_escrow_dispute_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_escrow_held_by_admin_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_escrow_released_by_admin_id;
DROP INDEX IF EXISTS public.idx_dccs_disputes_assigned_admin_id;
DROP INDEX IF EXISTS public.idx_dccs_disputes_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_disputes_defendant_id;
DROP INDEX IF EXISTS public.idx_dccs_disputes_plaintiff_id;
DROP INDEX IF EXISTS public.idx_dccs_disputes_snippet_id;