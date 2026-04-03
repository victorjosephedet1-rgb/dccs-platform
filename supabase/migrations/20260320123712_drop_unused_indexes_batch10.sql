/*
  # Drop Unused Indexes - Batch 10

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 10: Platform, Podcast, Premium, Project tables

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_platform_usage_detection_snippet_id;
DROP INDEX IF EXISTS public.idx_platform_usage_tracking_license_id;
DROP INDEX IF EXISTS public.idx_platform_violations_user_id;
DROP INDEX IF EXISTS public.idx_podcast_content_creator_id;
DROP INDEX IF EXISTS public.idx_premium_subscriptions_artist_id;
DROP INDEX IF EXISTS public.idx_premium_subscriptions_subscriber_id;
DROP INDEX IF EXISTS public.idx_project_collaborators_user_id;
DROP INDEX IF EXISTS public.idx_projects_user_id;
DROP INDEX IF EXISTS public.idx_royalty_agreements_artist_id;
DROP INDEX IF EXISTS public.idx_royalty_audit_log_artist_id;
DROP INDEX IF EXISTS public.idx_royalty_audit_log_license_id;
DROP INDEX IF EXISTS public.idx_royalty_audit_log_payout_id;