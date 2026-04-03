/*
  # Drop Unused Indexes - Batch 3
  
  1. Performance Improvements
    - Continue removing unused indexes
  
  2. Indexes Dropped (Batch 3 - 30 indexes)
*/

DROP INDEX IF EXISTS idx_content_fingerprints_license_id;
DROP INDEX IF EXISTS idx_content_moderation_flags_snippet_id;
DROP INDEX IF EXISTS idx_copyright_claims_claimant_id;
DROP INDEX IF EXISTS idx_copyright_claims_resolved_by;
DROP INDEX IF EXISTS idx_copyright_claims_respondent_id;
DROP INDEX IF EXISTS idx_copyright_claims_snippet_id;
DROP INDEX IF EXISTS idx_creator_verification_verified_by;
DROP INDEX IF EXISTS idx_dccs_ai_guidance_logs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_ai_guidance_logs_user_id;
DROP INDEX IF EXISTS idx_dccs_ai_monitoring_log_dccs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_ai_training_consent_creator_id;
DROP INDEX IF EXISTS idx_dccs_certificates_audio_snippet_id;
DROP INDEX IF EXISTS idx_dccs_certificates_creator_id;
DROP INDEX IF EXISTS idx_dccs_certificates_podcast_id;
DROP INDEX IF EXISTS idx_dccs_certificates_video_id;
DROP INDEX IF EXISTS idx_dccs_copyright_claims_dccs_certificate_id;
DROP INDEX IF EXISTS idx_dccs_copyright_claims_detection_id;
DROP INDEX IF EXISTS idx_deployment_versions_deployed_at;
DROP INDEX IF EXISTS idx_deployment_versions_status;
DROP INDEX IF EXISTS idx_customer_instances_url;
DROP INDEX IF EXISTS idx_customer_instances_auto_update;
DROP INDEX IF EXISTS idx_customer_instances_sync_status;
DROP INDEX IF EXISTS idx_deployment_logs_version;
DROP INDEX IF EXISTS idx_deployment_logs_instance;
DROP INDEX IF EXISTS idx_deployment_logs_created_at;
DROP INDEX IF EXISTS idx_update_notifications_version;
DROP INDEX IF EXISTS idx_update_notifications_instance;
DROP INDEX IF EXISTS idx_update_notifications_status;
DROP INDEX IF EXISTS idx_dccs_dispute_cases_resolved_by;
DROP INDEX IF EXISTS idx_dccs_dispute_cases_respondent_id;