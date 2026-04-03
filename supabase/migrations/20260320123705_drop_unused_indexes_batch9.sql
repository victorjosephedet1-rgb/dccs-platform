/*
  # Drop Unused Indexes - Batch 9

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 9: Pack, Payment, Platform tables

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_pack_assets_snippet_id;
DROP INDEX IF EXISTS public.idx_pack_purchases_pack_id;
DROP INDEX IF EXISTS public.idx_pack_purchases_user_id;
DROP INDEX IF EXISTS public.idx_payment_records_dccs_id;
DROP INDEX IF EXISTS public.idx_payment_records_user_id;
DROP INDEX IF EXISTS public.idx_platform_info_updated_by;
DROP INDEX IF EXISTS public.idx_platform_revenue_artist_id;
DROP INDEX IF EXISTS public.idx_platform_revenue_detection_id;
DROP INDEX IF EXISTS public.idx_platform_revenue_license_id;
DROP INDEX IF EXISTS public.idx_platform_revenue_payout_id;
DROP INDEX IF EXISTS public.idx_platform_revenue_snippet_id;
DROP INDEX IF EXISTS public.idx_platform_usage_detection_fingerprint_id;