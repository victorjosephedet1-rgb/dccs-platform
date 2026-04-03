/*
  # Drop Unused Indexes - Batch 2

  1. Performance Optimization
    - Remove unused indexes from ai_*, artist_*, audio_*, audit_*, bank_*, blockchain_*, bookings tables
    - These indexes are not being used by any queries
    - Reduces write overhead and storage usage

  2. Impact
    - Improves INSERT/UPDATE/DELETE performance
    - Frees up storage space
    - Reduces index maintenance overhead
*/

-- ai_content_scans
DROP INDEX IF EXISTS idx_ai_content_scans_uploaded_by;

-- ai_guidance_interactions
DROP INDEX IF EXISTS idx_ai_guidance_interactions_user_id;

-- artist_tips
DROP INDEX IF EXISTS idx_artist_tips_from_user_id;
DROP INDEX IF EXISTS idx_artist_tips_to_artist_id;

-- audio_fingerprints
DROP INDEX IF EXISTS idx_audio_fingerprints_agreement_id;
DROP INDEX IF EXISTS idx_audio_fingerprints_snippet_id;

-- audio_snippets
DROP INDEX IF EXISTS idx_audio_snippets_exclusivity_declaration_id;

-- audit_logs
DROP INDEX IF EXISTS idx_audit_logs_user_id;

-- bank_accounts
DROP INDEX IF EXISTS idx_bank_accounts_payout_identity_id;

-- blockchain_transactions
DROP INDEX IF EXISTS idx_blockchain_transactions_snippet_id;

-- bookings
DROP INDEX IF EXISTS idx_bookings_artist_id;
DROP INDEX IF EXISTS idx_bookings_client_id;
