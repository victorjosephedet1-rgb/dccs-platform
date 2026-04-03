/*
  # Drop Unused Indexes - Batch 8

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 8: Instant logins, Legal, Licensing tables

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_instant_logins_user_id;
DROP INDEX IF EXISTS public.idx_instant_payouts_artist_id;
DROP INDEX IF EXISTS public.idx_instant_payouts_license_id;
DROP INDEX IF EXISTS public.idx_legal_agreements_created_by;
DROP INDEX IF EXISTS public.idx_licensing_terms_buyer_id;
DROP INDEX IF EXISTS public.idx_licensing_terms_license_agreement_id;
DROP INDEX IF EXISTS public.idx_licensing_terms_snippet_id;
DROP INDEX IF EXISTS public.idx_notifications_user_id;
DROP INDEX IF EXISTS public.idx_indexing_jobs_status;
DROP INDEX IF EXISTS public.idx_indexing_jobs_created_at;
DROP INDEX IF EXISTS public.idx_indexing_jobs_type;
DROP INDEX IF EXISTS public.idx_otp_attempts_user_id;