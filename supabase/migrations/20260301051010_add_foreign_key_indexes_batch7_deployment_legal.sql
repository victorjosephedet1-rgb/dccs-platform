/*
  # Add Foreign Key Indexes - Batch 7 (Deployment, DMCA, Legal)
  
  1. Performance Improvements
    - Add indexes for unindexed foreign keys
  
  2. Tables Covered
    - deployment_logs
    - dmca_notices
    - event_tickets
    - exclusivity_declarations
    - exclusivity_violations
    - gdpr_requests
    - instant_logins
    - instant_payouts
    - legal_agreements
    - licensing_terms
*/

CREATE INDEX IF NOT EXISTS idx_deployment_logs_customer_instance_id 
  ON deployment_logs(customer_instance_id);

CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment_version_id 
  ON deployment_logs(deployment_version_id);

CREATE INDEX IF NOT EXISTS idx_dmca_notices_reviewed_by 
  ON dmca_notices(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_dmca_notices_snippet_id 
  ON dmca_notices(snippet_id);

CREATE INDEX IF NOT EXISTS idx_event_tickets_artist_id 
  ON event_tickets(artist_id);

CREATE INDEX IF NOT EXISTS idx_event_tickets_buyer_id 
  ON event_tickets(buyer_id);

CREATE INDEX IF NOT EXISTS idx_exclusivity_declarations_snippet_id 
  ON exclusivity_declarations(snippet_id);

CREATE INDEX IF NOT EXISTS idx_exclusivity_declarations_user_id 
  ON exclusivity_declarations(user_id);

CREATE INDEX IF NOT EXISTS idx_exclusivity_violations_reported_by 
  ON exclusivity_violations(reported_by);

CREATE INDEX IF NOT EXISTS idx_exclusivity_violations_reviewed_by 
  ON exclusivity_violations(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_exclusivity_violations_snippet_id 
  ON exclusivity_violations(snippet_id);

CREATE INDEX IF NOT EXISTS idx_gdpr_requests_processed_by 
  ON gdpr_requests(processed_by);

CREATE INDEX IF NOT EXISTS idx_gdpr_requests_user_id 
  ON gdpr_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_instant_logins_user_id 
  ON instant_logins(user_id);

CREATE INDEX IF NOT EXISTS idx_instant_payouts_artist_id 
  ON instant_payouts(artist_id);

CREATE INDEX IF NOT EXISTS idx_instant_payouts_license_id 
  ON instant_payouts(license_id);

CREATE INDEX IF NOT EXISTS idx_legal_agreements_created_by 
  ON legal_agreements(created_by);

CREATE INDEX IF NOT EXISTS idx_licensing_terms_buyer_id 
  ON licensing_terms(buyer_id);

CREATE INDEX IF NOT EXISTS idx_licensing_terms_license_agreement_id 
  ON licensing_terms(license_agreement_id);

CREATE INDEX IF NOT EXISTS idx_licensing_terms_snippet_id 
  ON licensing_terms(snippet_id);