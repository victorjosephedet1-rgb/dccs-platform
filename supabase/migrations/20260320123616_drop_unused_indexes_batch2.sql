/*
  # Drop Unused Indexes - Batch 2

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 2: Content and Copyright tables

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_content_fingerprints_license_id;
DROP INDEX IF EXISTS public.idx_content_fingerprints_podcast_id;
DROP INDEX IF EXISTS public.idx_content_fingerprints_track_id;
DROP INDEX IF EXISTS public.idx_content_fingerprints_video_id;
DROP INDEX IF EXISTS public.idx_content_moderation_flags_reviewed_by;
DROP INDEX IF EXISTS public.idx_content_moderation_flags_snippet_id;
DROP INDEX IF EXISTS public.idx_copyright_claims_claimant_id;
DROP INDEX IF EXISTS public.idx_copyright_claims_resolved_by;
DROP INDEX IF EXISTS public.idx_copyright_claims_respondent_id;
DROP INDEX IF EXISTS public.idx_copyright_claims_snippet_id;
DROP INDEX IF EXISTS public.idx_creator_verification_verified_by;
DROP INDEX IF EXISTS public.idx_customer_instances_current_version_id;