/*
  # Drop Unused Indexes - Batch 2

  1. Performance Improvements
    - Remove indexes that are not being used

  2. Indexes Removed (20 indexes)
*/

DROP INDEX IF EXISTS public.idx_copyright_claims_respondent_id;
DROP INDEX IF EXISTS public.idx_copyright_claims_snippet_id;
DROP INDEX IF EXISTS public.idx_dccs_ai_guidance_logs_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_ai_guidance_logs_user_id;
DROP INDEX IF EXISTS public.idx_dccs_ai_training_consent_creator_id;
DROP INDEX IF EXISTS public.idx_dccs_certificates_audio_snippet_id;
DROP INDEX IF EXISTS public.idx_dccs_certificates_creator_id;
DROP INDEX IF EXISTS public.idx_dccs_certificates_podcast_id;
DROP INDEX IF EXISTS public.idx_dccs_certificates_video_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_activity_logs_actor_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_activity_logs_dispute_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_cases_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_cases_claimant_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_cases_resolved_by;
DROP INDEX IF EXISTS public.idx_dccs_dispute_cases_respondent_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_escrow_dispute_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_escrow_held_by_admin_id;
DROP INDEX IF EXISTS public.idx_dccs_dispute_escrow_released_by_admin_id;
DROP INDEX IF EXISTS public.idx_dccs_disputes_assigned_admin_id;
DROP INDEX IF EXISTS public.idx_dccs_disputes_certificate_id;
