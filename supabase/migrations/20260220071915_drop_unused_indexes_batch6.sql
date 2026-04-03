/*
  # Drop Unused Indexes - Batch 6

  1. Performance Improvements
    - Remove indexes that are not being used

  2. Indexes Removed (remaining indexes)
*/

DROP INDEX IF EXISTS public.idx_universal_transactions_user_id;
DROP INDEX IF EXISTS public.idx_upload_verification_artist_id;
DROP INDEX IF EXISTS public.idx_upload_verification_snippet_id;
DROP INDEX IF EXISTS public.idx_user_agreement_acceptances_agreement_id;
DROP INDEX IF EXISTS public.idx_video_content_creator_id;
DROP INDEX IF EXISTS public.idx_projects_user_id;
DROP INDEX IF EXISTS public.idx_projects_status;
DROP INDEX IF EXISTS public.idx_projects_type;
DROP INDEX IF EXISTS public.idx_projects_created_at;
DROP INDEX IF EXISTS public.idx_uploads_user_id;
DROP INDEX IF EXISTS public.idx_uploads_project_id;
DROP INDEX IF EXISTS public.idx_uploads_category;
DROP INDEX IF EXISTS public.idx_uploads_created_at;
DROP INDEX IF EXISTS public.idx_uploads_dccs_cert;
DROP INDEX IF EXISTS public.idx_upload_chunks_upload_id;
DROP INDEX IF EXISTS public.idx_upload_chunks_status;
DROP INDEX IF EXISTS public.idx_project_collaborators_project;
DROP INDEX IF EXISTS public.idx_project_collaborators_user;
DROP INDEX IF EXISTS public.idx_projects_title_search;
DROP INDEX IF EXISTS public.idx_uploads_filename_search;
DROP INDEX IF EXISTS public.idx_email_branding_config_active;
DROP INDEX IF EXISTS public.idx_otp_attempts_email;
DROP INDEX IF EXISTS public.idx_otp_attempts_user_id;
DROP INDEX IF EXISTS public.idx_otp_attempts_created_at;
DROP INDEX IF EXISTS public.idx_instant_logins_user_id;
DROP INDEX IF EXISTS public.idx_instant_logins_email;
DROP INDEX IF EXISTS public.idx_instant_logins_created_at;
DROP INDEX IF EXISTS public.idx_audio_snippets_active;
DROP INDEX IF EXISTS public.idx_audio_snippets_genre;
DROP INDEX IF EXISTS public.idx_audio_packs_active;
DROP INDEX IF EXISTS public.idx_audio_packs_pack_type;
DROP INDEX IF EXISTS public.idx_pack_assets_pack_id;
DROP INDEX IF EXISTS public.idx_pack_assets_snippet_id;
DROP INDEX IF EXISTS public.idx_snippet_licenses_user_id;
DROP INDEX IF EXISTS public.idx_snippet_licenses_snippet_id;
DROP INDEX IF EXISTS public.idx_snippet_licenses_pack_id;
DROP INDEX IF EXISTS public.idx_pack_purchases_stripe_session;
DROP INDEX IF EXISTS public.idx_uploads_file_type;
DROP INDEX IF EXISTS public.idx_creator_verification_verified_by;
DROP INDEX IF EXISTS public.idx_platform_features_status;
DROP INDEX IF EXISTS public.idx_platform_features_display_order;
DROP INDEX IF EXISTS public.idx_platform_milestones_category;
DROP INDEX IF EXISTS public.idx_platform_detections_certificate;
DROP INDEX IF EXISTS public.idx_platform_detections_platform;
DROP INDEX IF EXISTS public.idx_platform_detections_detected_at;
DROP INDEX IF EXISTS public.idx_platform_detections_url;
DROP INDEX IF EXISTS public.idx_copyright_claims_detection;
DROP INDEX IF EXISTS public.idx_copyright_claims_certificate;
DROP INDEX IF EXISTS public.idx_copyright_claims_platform_status;
DROP INDEX IF EXISTS public.idx_copyright_claims_filed_at;
DROP INDEX IF EXISTS public.idx_royalty_collections_claim;
DROP INDEX IF EXISTS public.idx_royalty_collections_certificate;
DROP INDEX IF EXISTS public.idx_royalty_collections_platform;
DROP INDEX IF EXISTS public.idx_royalty_collections_date;
DROP INDEX IF EXISTS public.idx_royalty_collections_status;
DROP INDEX IF EXISTS public.idx_platform_licenses_name;
DROP INDEX IF EXISTS public.idx_platform_licenses_status;
DROP INDEX IF EXISTS public.idx_ai_monitoring_log_performed_at;
DROP INDEX IF EXISTS public.idx_ai_monitoring_log_action_type;
DROP INDEX IF EXISTS public.idx_ai_monitoring_log_certificate;
DROP INDEX IF EXISTS public.idx_uploads_registration_type;
DROP INDEX IF EXISTS public.idx_uploads_marketplace;
DROP INDEX IF EXISTS public.idx_uploads_downloadable;
DROP INDEX IF EXISTS public.idx_download_history_user;
DROP INDEX IF EXISTS public.idx_download_history_upload;
DROP INDEX IF EXISTS public.idx_download_history_upload_id;
DROP INDEX IF EXISTS public.idx_download_history_user_id;
