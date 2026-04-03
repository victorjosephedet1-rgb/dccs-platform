/*
  # Drop Unused Indexes - Security Fix Batch 8
  
  1. Changes
    - Drops unused indexes on dccs_ai_guidance_logs
    - Drops unused indexes on dccs_ai_monitoring_log
    - Drops unused indexes on dccs_ai_training_consent
    - Drops unused indexes on dccs_certificates
    - Drops unused indexes on dccs_copyright_claims
    - Improves database performance
  
  2. Security
    - No RLS changes
    - Performance improvement only
*/

-- Drop unused indexes on AI guidance and monitoring
DROP INDEX IF EXISTS idx_dccs_ai_guidance_logs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_ai_guidance_logs_user_id;
DROP INDEX IF EXISTS idx_dccs_ai_monitoring_log_dccs_certificate_id;

-- Drop unused indexes on AI training consent
DROP INDEX IF EXISTS idx_dccs_ai_training_consent_creator_id;

-- Drop unused indexes on certificates
DROP INDEX IF EXISTS idx_dccs_certificates_audio_snippet_id;
DROP INDEX IF EXISTS idx_dccs_certificates_creator_id;
DROP INDEX IF EXISTS idx_dccs_certificates_podcast_id;
DROP INDEX IF EXISTS idx_dccs_certificates_video_id;

-- Drop unused indexes on copyright claims
DROP INDEX IF EXISTS idx_dccs_copyright_claims_dccs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_copyright_claims_detection_id;