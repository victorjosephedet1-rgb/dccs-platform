/*
  # Drop Unused Indexes - Batch 3

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 3: DCCS AI and Guidance tables

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_dccs_ai_guidance_logs_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_ai_guidance_logs_user_id;
DROP INDEX IF EXISTS public.idx_dccs_ai_monitoring_log_dccs_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_ai_monitoring_log_detection_id;
DROP INDEX IF EXISTS public.idx_dccs_ai_training_consent_creator_id;
DROP INDEX IF EXISTS public.idx_dccs_certificates_audio_snippet_id;
DROP INDEX IF EXISTS public.idx_dccs_certificates_creator_id;
DROP INDEX IF EXISTS public.idx_dccs_certificates_podcast_id;
DROP INDEX IF EXISTS public.idx_dccs_certificates_video_id;
DROP INDEX IF EXISTS public.idx_dccs_copyright_claims_dccs_certificate_id;
DROP INDEX IF EXISTS public.idx_dccs_copyright_claims_detection_id;