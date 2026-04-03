/*
  # Add Foreign Key Indexes - Batch 3 (DCCS AI and Certificates)

  1. Performance Improvements
    - Add indexes for all foreign keys in dccs_ai_* and dccs_certificates tables
    - Essential for DCCS content tracking and AI monitoring

  2. Tables Covered
    - dccs_ai_guidance_logs
    - dccs_ai_monitoring_log
    - dccs_ai_training_consent
    - dccs_certificates
    - dccs_copyright_claims
*/

-- dccs_ai_guidance_logs
CREATE INDEX IF NOT EXISTS idx_dccs_ai_guidance_logs_certificate_id 
  ON dccs_ai_guidance_logs(certificate_id);
CREATE INDEX IF NOT EXISTS idx_dccs_ai_guidance_logs_user_id 
  ON dccs_ai_guidance_logs(user_id);

-- dccs_ai_monitoring_log
CREATE INDEX IF NOT EXISTS idx_dccs_ai_monitoring_log_dccs_certificate_id 
  ON dccs_ai_monitoring_log(dccs_certificate_id);

-- dccs_ai_training_consent
CREATE INDEX IF NOT EXISTS idx_dccs_ai_training_consent_creator_id 
  ON dccs_ai_training_consent(creator_id);

-- dccs_certificates
CREATE INDEX IF NOT EXISTS idx_dccs_certificates_audio_snippet_id 
  ON dccs_certificates(audio_snippet_id);
CREATE INDEX IF NOT EXISTS idx_dccs_certificates_creator_id 
  ON dccs_certificates(creator_id);
CREATE INDEX IF NOT EXISTS idx_dccs_certificates_podcast_id 
  ON dccs_certificates(podcast_id);
CREATE INDEX IF NOT EXISTS idx_dccs_certificates_video_id 
  ON dccs_certificates(video_id);

-- dccs_copyright_claims
CREATE INDEX IF NOT EXISTS idx_dccs_copyright_claims_dccs_certificate_id 
  ON dccs_copyright_claims(dccs_certificate_id);
CREATE INDEX IF NOT EXISTS idx_dccs_copyright_claims_detection_id 
  ON dccs_copyright_claims(detection_id);
