/*
  # Drop Unused Indexes - Batch 1

  1. Performance Improvements
    - Remove indexes that are not being used
    - Reduces storage overhead and write performance penalty

  2. Indexes Removed (20 indexes)
    - Various unused indexes on ai_content_scans, ai_guidance_interactions, artist_tips, etc.
*/

DROP INDEX IF EXISTS public.idx_ai_content_scans_uploaded_by;
DROP INDEX IF EXISTS public.idx_ai_guidance_interactions_user_id;
DROP INDEX IF EXISTS public.idx_artist_tips_from_user_id;
DROP INDEX IF EXISTS public.idx_artist_tips_to_artist_id;
DROP INDEX IF EXISTS public.idx_audio_fingerprints_agreement_id;
DROP INDEX IF EXISTS public.idx_audio_fingerprints_snippet_id;
DROP INDEX IF EXISTS public.idx_audio_snippets_exclusivity_declaration_id;
DROP INDEX IF EXISTS public.idx_audit_logs_user_id;
DROP INDEX IF EXISTS public.idx_bank_accounts_payout_identity_id;
DROP INDEX IF EXISTS public.idx_blockchain_transactions_snippet_id;
DROP INDEX IF EXISTS public.idx_bookings_artist_id;
DROP INDEX IF EXISTS public.idx_bookings_client_id;
DROP INDEX IF EXISTS public.idx_content_fingerprints_license_id;
DROP INDEX IF EXISTS public.idx_content_fingerprints_podcast_id;
DROP INDEX IF EXISTS public.idx_content_fingerprints_track_id;
DROP INDEX IF EXISTS public.idx_content_fingerprints_video_id;
DROP INDEX IF EXISTS public.idx_content_moderation_flags_reviewed_by;
DROP INDEX IF EXISTS public.idx_content_moderation_flags_snippet_id;
DROP INDEX IF EXISTS public.idx_copyright_claims_claimant_id;
DROP INDEX IF EXISTS public.idx_copyright_claims_resolved_by;
