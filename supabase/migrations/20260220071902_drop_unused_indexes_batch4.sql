/*
  # Drop Unused Indexes - Batch 4

  1. Performance Improvements
    - Remove indexes that are not being used

  2. Indexes Removed (20 indexes)
*/

DROP INDEX IF EXISTS public.idx_exclusivity_violations_reported_by;
DROP INDEX IF EXISTS public.idx_exclusivity_violations_reviewed_by;
DROP INDEX IF EXISTS public.idx_exclusivity_violations_snippet_id;
DROP INDEX IF EXISTS public.idx_gdpr_requests_processed_by;
DROP INDEX IF EXISTS public.idx_gdpr_requests_user_id;
DROP INDEX IF EXISTS public.idx_instant_payouts_artist_id;
DROP INDEX IF EXISTS public.idx_instant_payouts_license_id;
DROP INDEX IF EXISTS public.idx_legal_agreements_created_by;
DROP INDEX IF EXISTS public.idx_licensing_terms_buyer_id;
DROP INDEX IF EXISTS public.idx_licensing_terms_license_agreement_id;
DROP INDEX IF EXISTS public.idx_licensing_terms_snippet_id;
DROP INDEX IF EXISTS public.idx_notifications_user_id;
DROP INDEX IF EXISTS public.idx_pack_purchases_pack_id;
DROP INDEX IF EXISTS public.idx_pack_purchases_user_id;
DROP INDEX IF EXISTS public.idx_platform_revenue_artist_id;
DROP INDEX IF EXISTS public.idx_platform_revenue_detection_id;
DROP INDEX IF EXISTS public.idx_platform_revenue_license_id;
DROP INDEX IF EXISTS public.idx_platform_revenue_payout_id;
DROP INDEX IF EXISTS public.idx_platform_revenue_snippet_id;
DROP INDEX IF EXISTS public.idx_platform_usage_detection_fingerprint_id;
