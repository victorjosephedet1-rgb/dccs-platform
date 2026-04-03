/*
  # Add Foreign Key Indexes - Batch 1 (AI and Audio tables)

  1. Performance Improvements
    - Add indexes for all foreign keys in ai_*, artist_*, audio_*, audit_*, bank_*, blockchain_*, bookings tables
    - Ensures optimal JOIN performance
    - Prevents full table scans

  2. Tables Covered
    - ai_content_scans
    - ai_guidance_interactions
    - artist_tips
    - audio_fingerprints
    - audio_snippets
    - audit_logs
    - bank_accounts
    - blockchain_transactions
    - bookings
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
