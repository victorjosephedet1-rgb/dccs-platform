/*
  # Add Foreign Key Indexes - Batch 3 (DCCS AI Tables)
  
  1. Performance Improvements
    - Add indexes for unindexed foreign keys
  
  2. Tables Covered
    - dccs_ai_guidance_logs
    - dccs_ai_monitoring_log
    - dccs_ai_training_consent
    - dccs_certificates
    - dccs_copyright_claims
*/

CREATE INDEX IF NOT EXISTS idx_dccs_ai_guidance_logs_certificate_id 
  ON dccs_ai_guidance_logs(certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_ai_guidance_logs_user_id 
  ON dccs_ai_guidance_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_dccs_ai_monitoring_log_dccs_certificate_id 
  ON dccs_ai_monitoring_log(dccs_certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_ai_training_consent_creator_id 
  ON dccs_ai_training_consent(creator_id);

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_audio_snippet_id 
  ON dccs_certificates(audio_snippet_id);

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_creator_id 
  ON dccs_certificates(creator_id);

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_podcast_id 
  ON dccs_certificates(podcast_id);

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_video_id 
  ON dccs_certificates(video_id);

CREATE INDEX IF NOT EXISTS idx_dccs_copyright_claims_dccs_certificate_id 
  ON dccs_copyright_claims(dccs_certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_copyright_claims_detection_id 
  ON dccs_copyright_claims(detection_id);