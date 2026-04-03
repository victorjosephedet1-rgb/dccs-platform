/*
  # Drop Unused Indexes - Batch 2
  
  1. Performance Improvements
    - Continue removing unused indexes
  
  2. Indexes Dropped (Batch 2 - 30 indexes)
*/

DROP INDEX IF EXISTS idx_track_licenses_artist_id;
DROP INDEX IF EXISTS idx_track_licenses_buyer_id;
DROP INDEX IF EXISTS idx_track_licenses_podcast_id;
DROP INDEX IF EXISTS idx_track_licenses_track_id;
DROP INDEX IF EXISTS idx_track_licenses_video_id;
DROP INDEX IF EXISTS idx_unified_content_fingerprints_dccs_certificate_id;
DROP INDEX IF EXISTS idx_universal_transactions_user_id;
DROP INDEX IF EXISTS idx_upload_verification_artist_id;
DROP INDEX IF EXISTS idx_upload_verification_snippet_id;
DROP INDEX IF EXISTS idx_ai_content_scans_uploaded_by;
DROP INDEX IF EXISTS idx_ai_guidance_interactions_user_id;
DROP INDEX IF EXISTS idx_artist_tips_from_user_id;
DROP INDEX IF EXISTS idx_artist_tips_to_artist_id;
DROP INDEX IF EXISTS idx_audio_fingerprints_agreement_id;
DROP INDEX IF EXISTS idx_audio_fingerprints_snippet_id;
DROP INDEX IF EXISTS idx_audio_snippets_exclusivity_declaration_id;
DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_bank_accounts_payout_identity_id;
DROP INDEX IF EXISTS idx_blockchain_transactions_snippet_id;
DROP INDEX IF EXISTS idx_bookings_artist_id;
DROP INDEX IF EXISTS idx_bookings_client_id;
DROP INDEX IF EXISTS idx_uploads_dccs_certificate_id;
DROP INDEX IF EXISTS idx_uploads_project_id;
DROP INDEX IF EXISTS idx_uploads_user_id;
DROP INDEX IF EXISTS idx_user_agreement_acceptances_agreement_id;
DROP INDEX IF EXISTS idx_video_content_creator_id;
DROP INDEX IF EXISTS idx_content_fingerprints_podcast_id;
DROP INDEX IF EXISTS idx_content_fingerprints_track_id;
DROP INDEX IF EXISTS idx_content_fingerprints_video_id;
DROP INDEX IF EXISTS idx_content_moderation_flags_reviewed_by;