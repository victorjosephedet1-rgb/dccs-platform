/*
  # Add Foreign Key Indexes - Batch 1 (AI and Audio Tables)
  
  1. Performance Improvements
    - Add indexes for unindexed foreign keys
    - Improves JOIN performance and foreign key constraint validation
  
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

CREATE INDEX IF NOT EXISTS idx_ai_content_scans_uploaded_by 
  ON ai_content_scans(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_ai_guidance_interactions_user_id 
  ON ai_guidance_interactions(user_id);

CREATE INDEX IF NOT EXISTS idx_artist_tips_from_user_id 
  ON artist_tips(from_user_id);

CREATE INDEX IF NOT EXISTS idx_artist_tips_to_artist_id 
  ON artist_tips(to_artist_id);

CREATE INDEX IF NOT EXISTS idx_audio_fingerprints_agreement_id 
  ON audio_fingerprints(agreement_id);

CREATE INDEX IF NOT EXISTS idx_audio_fingerprints_snippet_id 
  ON audio_fingerprints(snippet_id);

CREATE INDEX IF NOT EXISTS idx_audio_snippets_exclusivity_declaration_id 
  ON audio_snippets(exclusivity_declaration_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
  ON audit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_payout_identity_id 
  ON bank_accounts(payout_identity_id);

CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_snippet_id 
  ON blockchain_transactions(snippet_id);

CREATE INDEX IF NOT EXISTS idx_bookings_artist_id 
  ON bookings(artist_id);

CREATE INDEX IF NOT EXISTS idx_bookings_client_id 
  ON bookings(client_id);