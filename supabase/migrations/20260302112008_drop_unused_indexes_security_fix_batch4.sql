/*
  # Drop Unused Indexes - Security Fix Batch 4
  
  1. Changes
    - Drops unused indexes on ai_content_scans, ai_guidance_interactions
    - Drops unused indexes on artist_tips, audio_fingerprints
    - Drops unused indexes on audio_snippets, audit_logs
    - Drops unused indexes on bank_accounts, blockchain_transactions
    - Drops unused indexes on bookings, notifications
    - Improves database performance
  
  2. Security
    - No RLS changes
    - Performance improvement only
*/

-- Drop unused indexes on AI tables
DROP INDEX IF EXISTS idx_ai_content_scans_uploaded_by;
DROP INDEX IF EXISTS idx_ai_guidance_interactions_user_id;

-- Drop unused indexes on artist and audio tables
DROP INDEX IF EXISTS idx_artist_tips_from_user_id;
DROP INDEX IF EXISTS idx_artist_tips_to_artist_id;
DROP INDEX IF EXISTS idx_audio_fingerprints_agreement_id;
DROP INDEX IF EXISTS idx_audio_fingerprints_snippet_id;
DROP INDEX IF EXISTS idx_audio_snippets_exclusivity_declaration_id;

-- Drop unused indexes on audit and account tables
DROP INDEX IF EXISTS idx_audit_logs_user_id;
DROP INDEX IF EXISTS idx_bank_accounts_payout_identity_id;
DROP INDEX IF EXISTS idx_blockchain_transactions_snippet_id;

-- Drop unused indexes on booking and notification tables
DROP INDEX IF EXISTS idx_bookings_artist_id;
DROP INDEX IF EXISTS idx_bookings_client_id;
DROP INDEX IF EXISTS idx_notifications_user_id;

-- Drop unused indexes on otp and pack tables
DROP INDEX IF EXISTS idx_otp_attempts_user_id;
DROP INDEX IF EXISTS idx_pack_assets_snippet_id;
DROP INDEX IF EXISTS idx_pack_purchases_pack_id;
DROP INDEX IF EXISTS idx_pack_purchases_user_id;