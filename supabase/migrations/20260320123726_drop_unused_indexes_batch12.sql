/*
  # Drop Unused Indexes - Batch 12

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 12: Unified, Universal, Update, Upload tables

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_unified_content_fingerprints_dccs_certificate_id;
DROP INDEX IF EXISTS public.idx_universal_transactions_user_id;
DROP INDEX IF EXISTS public.idx_update_notifications_customer_instance_id;
DROP INDEX IF EXISTS public.idx_update_notifications_deployment_version_id;
DROP INDEX IF EXISTS public.idx_upload_verification_artist_id;
DROP INDEX IF EXISTS public.idx_upload_verification_snippet_id;
DROP INDEX IF EXISTS public.idx_uploads_dccs_certificate_id;
DROP INDEX IF EXISTS public.idx_uploads_project_id;
DROP INDEX IF EXISTS public.idx_uploads_user_id;
DROP INDEX IF EXISTS public.idx_user_agreement_acceptances_agreement_id;
DROP INDEX IF EXISTS public.idx_video_content_creator_id;