/*
  # Drop Unused Indexes - Batch 15

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 15: Platform health, deployment verification, Google indexing

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_platform_health_logs_checked_at;
DROP INDEX IF EXISTS public.idx_platform_health_logs_status;
DROP INDEX IF EXISTS public.idx_deployment_verification_commit;
DROP INDEX IF EXISTS public.idx_deployment_verification_status;
DROP INDEX IF EXISTS public.idx_deployment_verification_deployed_at;
DROP INDEX IF EXISTS public.idx_google_indexing_url;
DROP INDEX IF EXISTS public.idx_google_indexing_status;
DROP INDEX IF EXISTS public.idx_google_indexing_updated;