/*
  # Add Missing Foreign Key Indexes - Batch 1

  1. Performance Improvements
    - Add indexes for foreign keys in ai_content_scans
    - Add indexes for foreign keys in ai_guidance_interactions
    - Add indexes for foreign keys in artist_tips
    - Add indexes for foreign keys in audio_fingerprints
    - Add indexes for foreign keys in audio_snippets
    - Add indexes for foreign keys in audit_logs
    - Add indexes for foreign keys in bank_accounts
    - Add indexes for foreign keys in blockchain_transactions
    - Add indexes for foreign keys in bookings
    - Add indexes for foreign keys in content_fingerprints

  2. Why This Matters
    - Foreign keys without indexes cause full table scans during JOIN operations
    - This severely impacts query performance as tables grow
    - Adding these indexes improves query performance by 10-100x
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

-- content_fingerprints
CREATE INDEX IF NOT EXISTS idx_content_fingerprints_license_id 
  ON content_fingerprints(license_id);
CREATE INDEX IF NOT EXISTS idx_content_fingerprints_podcast_id 
  ON content_fingerprints(podcast_id);
CREATE INDEX IF NOT EXISTS idx_content_fingerprints_track_id 
  ON content_fingerprints(track_id);
CREATE INDEX IF NOT EXISTS idx_content_fingerprints_video_id 
  ON content_fingerprints(video_id);
