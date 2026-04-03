/*
  # Add Missing Foreign Key Indexes - Batch 2

  1. Performance Improvements
    - Add indexes for foreign keys in content_moderation_flags
    - Add indexes for foreign keys in copyright_claims
    - Add indexes for foreign keys in creator_verification
    - Add indexes for foreign keys in dccs_ai_guidance_logs
    - Add indexes for foreign keys in dccs_ai_monitoring_log
    - Add indexes for foreign keys in dccs_ai_training_consent
    - Add indexes for foreign keys in dccs_certificates
    - Add indexes for foreign keys in dccs_copyright_claims

  2. Why This Matters
    - Improves JOIN performance for moderation and DCCS systems
    - Critical for real-time content verification workflows
*/

-- content_moderation_flags
CREATE INDEX IF NOT EXISTS idx_content_moderation_flags_reviewed_by 
  ON content_moderation_flags(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_content_moderation_flags_snippet_id 
  ON content_moderation_flags(snippet_id);

-- copyright_claims
CREATE INDEX IF NOT EXISTS idx_copyright_claims_claimant_id 
  ON copyright_claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_copyright_claims_resolved_by 
  ON copyright_claims(resolved_by);
CREATE INDEX IF NOT EXISTS idx_copyright_claims_respondent_id 
  ON copyright_claims(respondent_id);
CREATE INDEX IF NOT EXISTS idx_copyright_claims_snippet_id 
  ON copyright_claims(snippet_id);

-- creator_verification
CREATE INDEX IF NOT EXISTS idx_creator_verification_verified_by 
  ON creator_verification(verified_by);

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
