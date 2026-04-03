/*
  # Drop Unused Indexes - Batch 7

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 7: DMCA, Events, Exclusivity tables

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_dmca_notices_reviewed_by;
DROP INDEX IF EXISTS public.idx_dmca_notices_snippet_id;
DROP INDEX IF EXISTS public.idx_event_tickets_artist_id;
DROP INDEX IF EXISTS public.idx_event_tickets_buyer_id;
DROP INDEX IF EXISTS public.idx_exclusivity_declarations_snippet_id;
DROP INDEX IF EXISTS public.idx_exclusivity_declarations_user_id;
DROP INDEX IF EXISTS public.idx_exclusivity_violations_reported_by;
DROP INDEX IF EXISTS public.idx_exclusivity_violations_reviewed_by;
DROP INDEX IF EXISTS public.idx_exclusivity_violations_snippet_id;
DROP INDEX IF EXISTS public.idx_gdpr_requests_processed_by;
DROP INDEX IF EXISTS public.idx_gdpr_requests_user_id;
DROP INDEX IF EXISTS public.idx_google_indexing_requests_requested_by;