/*
  # Drop Unused Indexes - Batch 3

  1. Performance Improvements
    - Remove indexes that are not being used

  2. Indexes Removed (20 indexes)
*/

DROP INDEX IF EXISTS public.idx_dccs_disputes_defendant_id;
DROP INDEX IF EXISTS public.idx_dccs_disputes_plaintiff_id;
DROP INDEX IF EXISTS public.idx_dccs_disputes_snippet_id;
DROP INDEX IF EXISTS public.idx_dccs_royalty_payment_audit_changed_by;
DROP INDEX IF EXISTS public.idx_dccs_royalty_payment_audit_payment_id;
DROP INDEX IF EXISTS public.idx_dccs_royalty_payments_artist_id;
DROP INDEX IF EXISTS public.idx_dccs_royalty_payments_buyer_id;
DROP INDEX IF EXISTS public.idx_dccs_royalty_payments_license_id;
DROP INDEX IF EXISTS public.idx_dccs_split_versions_changed_by;
DROP INDEX IF EXISTS public.idx_dccs_split_versions_locked_by;
DROP INDEX IF EXISTS public.idx_dccs_verification_logs_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_whitelist_evidence_buyer_id;
DROP INDEX IF EXISTS public.idx_dccs_whitelist_evidence_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_whitelist_evidence_license_id;
DROP INDEX IF EXISTS public.idx_dmca_notices_reviewed_by;
DROP INDEX IF EXISTS public.idx_dmca_notices_snippet_id;
DROP INDEX IF EXISTS public.idx_event_tickets_artist_id;
DROP INDEX IF EXISTS public.idx_event_tickets_buyer_id;
DROP INDEX IF EXISTS public.idx_exclusivity_declarations_snippet_id;
DROP INDEX IF EXISTS public.idx_exclusivity_declarations_user_id;
