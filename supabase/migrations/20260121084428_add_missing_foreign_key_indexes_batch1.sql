/*
  # Add Missing Foreign Key Indexes - Batch 1

  ## Summary
  Adds missing indexes for foreign key columns to improve query performance,
  especially for joins, cascading deletes, and referential integrity checks.
  
  ## Impact
  - Faster join operations
  - Improved delete/update performance with foreign keys
  - Better query plan generation
  
  ## Batch 1: Core tables (40 indexes)
*/

-- AI Content and Guidance Indexes
CREATE INDEX IF NOT EXISTS idx_ai_content_scans_uploaded_by 
  ON ai_content_scans(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_ai_guidance_interactions_user_id 
  ON ai_guidance_interactions(user_id);

-- Artist Tips Indexes
CREATE INDEX IF NOT EXISTS idx_artist_tips_from_user_id 
  ON artist_tips(from_user_id);

CREATE INDEX IF NOT EXISTS idx_artist_tips_to_artist_id 
  ON artist_tips(to_artist_id);

-- Audio Fingerprints Indexes
CREATE INDEX IF NOT EXISTS idx_audio_fingerprints_agreement_id 
  ON audio_fingerprints(agreement_id);

CREATE INDEX IF NOT EXISTS idx_audio_fingerprints_snippet_id 
  ON audio_fingerprints(snippet_id);

-- Audio Snippets Indexes
CREATE INDEX IF NOT EXISTS idx_audio_snippets_exclusivity_declaration_id 
  ON audio_snippets(exclusivity_declaration_id);

-- Audit Logs Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id 
  ON audit_logs(user_id);

-- Bank Accounts Indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_payout_identity_id 
  ON bank_accounts(payout_identity_id);

-- Blockchain Transactions Indexes
CREATE INDEX IF NOT EXISTS idx_blockchain_transactions_snippet_id 
  ON blockchain_transactions(snippet_id);

-- Bookings Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_artist_id 
  ON bookings(artist_id);

CREATE INDEX IF NOT EXISTS idx_bookings_client_id 
  ON bookings(client_id);

-- Content Fingerprints Indexes
CREATE INDEX IF NOT EXISTS idx_content_fingerprints_license_id 
  ON content_fingerprints(license_id);

CREATE INDEX IF NOT EXISTS idx_content_fingerprints_podcast_id 
  ON content_fingerprints(podcast_id);

CREATE INDEX IF NOT EXISTS idx_content_fingerprints_track_id 
  ON content_fingerprints(track_id);

CREATE INDEX IF NOT EXISTS idx_content_fingerprints_video_id 
  ON content_fingerprints(video_id);

-- Content Moderation Flags Indexes
CREATE INDEX IF NOT EXISTS idx_content_moderation_flags_reviewed_by 
  ON content_moderation_flags(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_content_moderation_flags_snippet_id 
  ON content_moderation_flags(snippet_id);

-- Copyright Claims Indexes
CREATE INDEX IF NOT EXISTS idx_copyright_claims_claimant_id 
  ON copyright_claims(claimant_id);

CREATE INDEX IF NOT EXISTS idx_copyright_claims_resolved_by 
  ON copyright_claims(resolved_by);

CREATE INDEX IF NOT EXISTS idx_copyright_claims_respondent_id 
  ON copyright_claims(respondent_id);

CREATE INDEX IF NOT EXISTS idx_copyright_claims_snippet_id 
  ON copyright_claims(snippet_id);

-- DCCS AI Guidance Logs Indexes
CREATE INDEX IF NOT EXISTS idx_dccs_ai_guidance_logs_certificate_id 
  ON dccs_ai_guidance_logs(certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_ai_guidance_logs_user_id 
  ON dccs_ai_guidance_logs(user_id);

-- DCCS AI Training Consent Indexes
CREATE INDEX IF NOT EXISTS idx_dccs_ai_training_consent_creator_id 
  ON dccs_ai_training_consent(creator_id);

-- DCCS Certificates Indexes
CREATE INDEX IF NOT EXISTS idx_dccs_certificates_audio_snippet_id 
  ON dccs_certificates(audio_snippet_id);

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_creator_id 
  ON dccs_certificates(creator_id);

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_podcast_id 
  ON dccs_certificates(podcast_id);

CREATE INDEX IF NOT EXISTS idx_dccs_certificates_video_id 
  ON dccs_certificates(video_id);

-- DCCS Dispute Activity Logs Indexes
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_activity_logs_actor_id 
  ON dccs_dispute_activity_logs(actor_id);

CREATE INDEX IF NOT EXISTS idx_dccs_dispute_activity_logs_dispute_id 
  ON dccs_dispute_activity_logs(dispute_id);

-- DCCS Dispute Cases Indexes
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_cases_certificate_id 
  ON dccs_dispute_cases(certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_dispute_cases_claimant_id 
  ON dccs_dispute_cases(claimant_id);

CREATE INDEX IF NOT EXISTS idx_dccs_dispute_cases_resolved_by 
  ON dccs_dispute_cases(resolved_by);

CREATE INDEX IF NOT EXISTS idx_dccs_dispute_cases_respondent_id 
  ON dccs_dispute_cases(respondent_id);

-- DCCS Dispute Escrow Indexes
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_escrow_dispute_id 
  ON dccs_dispute_escrow(dispute_id);

CREATE INDEX IF NOT EXISTS idx_dccs_dispute_escrow_held_by_admin_id 
  ON dccs_dispute_escrow(held_by_admin_id);

CREATE INDEX IF NOT EXISTS idx_dccs_dispute_escrow_released_by_admin_id 
  ON dccs_dispute_escrow(released_by_admin_id);

-- DCCS Disputes Indexes
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_assigned_admin_id 
  ON dccs_disputes(assigned_admin_id);

CREATE INDEX IF NOT EXISTS idx_dccs_disputes_certificate_id 
  ON dccs_disputes(certificate_id);
