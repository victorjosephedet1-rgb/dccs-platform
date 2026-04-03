/*
  # Drop Unused Indexes - Batch 4

  1. Performance Optimization
    - Remove unused indexes from dccs_ai_* and dccs_certificates tables
    - These indexes are not actively used in queries

  2. Indexes Removed
    - dccs_ai_guidance_logs (2 indexes)
    - dccs_ai_monitoring_log (2 indexes)
    - dccs_ai_training_consent (1 index)
    - dccs_certificates (4 indexes)
*/

-- dccs_ai_guidance_logs
DROP INDEX IF EXISTS idx_dccs_ai_guidance_logs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_ai_guidance_logs_user_id;

-- dccs_ai_monitoring_log
DROP INDEX IF EXISTS idx_dccs_ai_monitoring_log_dccs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_ai_monitoring_log_detection_id;

-- dccs_ai_training_consent
DROP INDEX IF EXISTS idx_dccs_ai_training_consent_creator_id;

-- dccs_certificates
DROP INDEX IF EXISTS idx_dccs_certificates_audio_snippet_id;
DROP INDEX IF EXISTS idx_dccs_certificates_creator_id;
DROP INDEX IF EXISTS idx_dccs_certificates_podcast_id;
DROP INDEX IF EXISTS idx_dccs_certificates_video_id;
