/*
  # Drop Unused Indexes - Batch 1

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 1: AI and Audio related tables

  2. Changes
    - Drop indexes that have not been used
*/

-- AI and Audio tables
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