/*
  # Add Missing Foreign Key Indexes - Batch 1

  1. Performance Improvements
    - Add indexes for foreign keys in ai_content_scans, ai_guidance_interactions, artist_tips
    - Add indexes for foreign keys in audio_fingerprints, audio_snippets, audit_logs
    - Add indexes for foreign keys in bank_accounts, blockchain_transactions, bookings

  2. Tables Affected
    - ai_content_scans: uploaded_by
    - ai_guidance_interactions: user_id
    - artist_tips: from_user_id, to_artist_id
    - audio_fingerprints: agreement_id, snippet_id
    - audio_snippets: exclusivity_declaration_id
    - audit_logs: user_id
    - bank_accounts: payout_identity_id
    - blockchain_transactions: snippet_id
    - bookings: artist_id, client_id
*/

-- ai_content_scans
CREATE INDEX IF NOT EXISTS idx_ai_content_scans_uploaded_by
ON ai_content_scans(uploaded_by);

-- ai_guidance_interactions
CREATE INDEX IF NOT EXISTS idx_ai_guidance_interactions_user_id
ON ai_guidance_interactions(user_id);

-- artist_tips
CREATE INDEX IF NOT EXISTS idx_artist_tips_from_user_id
ON artist_tips(from_user_id);

CREATE INDEX IF NOT EXISTS idx_artist_tips_to_artist_id
ON artist_tips(to_artist_id);

-- audio_fingerprints
CREATE INDEX IF NOT EXISTS idx_audio_fingerprints_agreement_id
ON audio_fingerprints(agreement_id);

CREATE INDEX IF NOT EXISTS idx_audio_fingerprints_snippet_id
ON audio_fingerprints(snippet_id);

-- audio_snippets
CREATE INDEX IF NOT EXISTS idx_audio_snippets_exclusivity_declaration_id
ON audio_snippets(exclusivity_declaration_id);

-- audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
ON audit_logs(user_id);

-- bank_accounts
CREATE INDEX IF NOT EXISTS idx_bank_accounts_payout_identity_id
ON bank_accounts(payout_identity_id);

-- blockchain_transactions
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_snippet_id
ON blockchain_transactions(snippet_id);

-- bookings
CREATE INDEX IF NOT EXISTS idx_bookings_artist_id
ON bookings(artist_id);

CREATE INDEX IF NOT EXISTS idx_bookings_client_id
ON bookings(client_id);
