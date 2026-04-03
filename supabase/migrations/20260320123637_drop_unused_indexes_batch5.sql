/*
  # Drop Unused Indexes - Batch 5

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 5: DCCS Download and Royalty tables

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_dccs_download_history_upload_id;
DROP INDEX IF EXISTS public.idx_dccs_download_history_user_id;
DROP INDEX IF EXISTS public.idx_dccs_platform_detections_dccs_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_registrations_dccs_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_registrations_upload_id;
DROP INDEX IF EXISTS public.idx_dccs_registrations_user_id;
DROP INDEX IF EXISTS public.idx_dccs_royalty_collections_claim_id;
DROP INDEX IF EXISTS public.idx_dccs_royalty_collections_dccs_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_royalty_payment_audit_changed_by;
DROP INDEX IF EXISTS public.idx_dccs_royalty_payment_audit_payment_id;
DROP INDEX IF EXISTS public.idx_dccs_royalty_payments_artist_id;
DROP INDEX IF EXISTS public.idx_dccs_royalty_payments_buyer_id;
DROP INDEX IF EXISTS public.idx_dccs_royalty_payments_license_id;