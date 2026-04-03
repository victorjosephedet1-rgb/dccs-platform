/*
  # Drop Unused Indexes - Batch 5

  1. Performance Improvements
    - Remove indexes that are not being used

  2. Indexes Removed (20 indexes)
*/

DROP INDEX IF EXISTS public.idx_platform_usage_detection_snippet_id;
DROP INDEX IF EXISTS public.idx_platform_usage_tracking_license_id;
DROP INDEX IF EXISTS public.idx_platform_violations_user_id;
DROP INDEX IF EXISTS public.idx_podcast_content_creator_id;
DROP INDEX IF EXISTS public.idx_premium_subscriptions_artist_id;
DROP INDEX IF EXISTS public.idx_premium_subscriptions_subscriber_id;
DROP INDEX IF EXISTS public.idx_royalty_agreements_artist_id;
DROP INDEX IF EXISTS public.idx_royalty_audit_log_artist_id;
DROP INDEX IF EXISTS public.idx_royalty_audit_log_license_id;
DROP INDEX IF EXISTS public.idx_royalty_audit_log_payout_id;
DROP INDEX IF EXISTS public.idx_royalty_audit_log_snippet_id;
DROP INDEX IF EXISTS public.idx_royalty_payments_recipient_id;
DROP INDEX IF EXISTS public.idx_royalty_payments_split_id;
DROP INDEX IF EXISTS public.idx_royalty_splits_booking_id;
DROP INDEX IF EXISTS public.idx_track_licenses_artist_id;
DROP INDEX IF EXISTS public.idx_track_licenses_buyer_id;
DROP INDEX IF EXISTS public.idx_track_licenses_podcast_id;
DROP INDEX IF EXISTS public.idx_track_licenses_track_id;
DROP INDEX IF EXISTS public.idx_track_licenses_video_id;
DROP INDEX IF EXISTS public.idx_unified_content_fingerprints_dccs_certificate_id;
