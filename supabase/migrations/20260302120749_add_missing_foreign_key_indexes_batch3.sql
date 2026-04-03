/*
  # Add Missing Foreign Key Indexes - Batch 3

  1. Performance Improvements
    - Add indexes for foreign keys in DCCS tables (ai_guidance_logs, ai_monitoring_log, ai_training_consent)
    - Add indexes for foreign keys in dccs_certificates
    - Add indexes for foreign keys in dccs_copyright_claims

  2. Tables Affected
    - dccs_ai_guidance_logs: certificate_id, user_id
    - dccs_ai_monitoring_log: dccs_certificate_id, detection_id
    - dccs_ai_training_consent: creator_id
    - dccs_certificates: audio_snippet_id, creator_id, podcast_id, video_id
    - dccs_copyright_claims: dccs_certificate_id, detection_id
*/

-- dccs_ai_guidance_logs
CREATE INDEX IF NOT EXISTS idx_dccs_ai_guidance_logs_certificate_id
ON dccs_ai_guidance_logs(certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_ai_guidance_logs_user_id
ON dccs_ai_guidance_logs(user_id);

-- dccs_ai_monitoring_log
CREATE INDEX IF NOT EXISTS idx_dccs_ai_monitoring_log_dccs_certificate_id
ON dccs_ai_monitoring_log(dccs_certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_ai_monitoring_log_detection_id
ON dccs_ai_monitoring_log(detection_id);

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
