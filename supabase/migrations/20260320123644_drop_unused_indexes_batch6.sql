/*
  # Drop Unused Indexes - Batch 6

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 6: DCCS Verification and Deployment tables

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_dccs_split_versions_changed_by;
DROP INDEX IF EXISTS public.idx_dccs_split_versions_locked_by;
DROP INDEX IF EXISTS public.idx_dccs_verification_logs_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_verification_requests_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_verification_requests_requested_by_user_id;
DROP INDEX IF EXISTS public.idx_dccs_whitelist_evidence_buyer_id;
DROP INDEX IF EXISTS public.idx_dccs_whitelist_evidence_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_whitelist_evidence_license_id;
DROP INDEX IF EXISTS public.idx_deployment_logs_customer_instance_id;
DROP INDEX IF EXISTS public.idx_deployment_logs_deployment_version_id;
DROP INDEX IF EXISTS public.idx_deployment_versions_deployed_by;