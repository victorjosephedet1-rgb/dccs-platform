/*
  # Drop Unused Indexes - Batch 5
  
  1. Performance Improvements
    - Continue removing unused indexes
  
  2. Indexes Dropped (Batch 5 - remaining indexes)
*/

DROP INDEX IF EXISTS idx_dccs_whitelist_evidence_certificate_id;
DROP INDEX IF EXISTS idx_profiles_phase1_creators;
DROP INDEX IF EXISTS idx_profiles_account_type;
DROP INDEX IF EXISTS idx_profiles_monetization;
DROP INDEX IF EXISTS idx_dmca_notices_reviewed_by;
DROP INDEX IF EXISTS idx_dmca_notices_snippet_id;
DROP INDEX IF EXISTS idx_event_tickets_artist_id;
DROP INDEX IF EXISTS idx_event_tickets_buyer_id;
DROP INDEX IF EXISTS idx_exclusivity_declarations_snippet_id;
DROP INDEX IF EXISTS idx_exclusivity_declarations_user_id;
DROP INDEX IF EXISTS idx_exclusivity_violations_reported_by;
DROP INDEX IF EXISTS idx_exclusivity_violations_reviewed_by;
DROP INDEX IF EXISTS idx_exclusivity_violations_snippet_id;
DROP INDEX IF EXISTS idx_gdpr_requests_processed_by;
DROP INDEX IF EXISTS idx_gdpr_requests_user_id;
DROP INDEX IF EXISTS idx_instant_logins_user_id;
DROP INDEX IF EXISTS idx_instant_payouts_artist_id;
DROP INDEX IF EXISTS idx_instant_payouts_license_id;
DROP INDEX IF EXISTS idx_legal_agreements_created_by;
DROP INDEX IF EXISTS idx_licensing_terms_buyer_id;
DROP INDEX IF EXISTS idx_licensing_terms_license_agreement_id;
DROP INDEX IF EXISTS idx_licensing_terms_snippet_id;
DROP INDEX IF EXISTS idx_dccs_registrations_user_id;
DROP INDEX IF EXISTS idx_dccs_registrations_upload_id;
DROP INDEX IF EXISTS idx_dccs_registrations_certificate_id;
DROP INDEX IF EXISTS idx_dccs_registrations_payment_status;
DROP INDEX IF EXISTS idx_dccs_registrations_blockchain_tx;
DROP INDEX IF EXISTS idx_dccs_registrations_created_at;
DROP INDEX IF EXISTS idx_dccs_registrations_stripe_intent;
DROP INDEX IF EXISTS idx_dccs_verification_dccs_code;
DROP INDEX IF EXISTS idx_dccs_verification_certificate_id;
DROP INDEX IF EXISTS idx_dccs_verification_status;
DROP INDEX IF EXISTS idx_dccs_verification_ip;
DROP INDEX IF EXISTS idx_dccs_verification_user;
DROP INDEX IF EXISTS idx_dccs_verification_created_at;