/*
  # Drop Unused Indexes - Batch 7

  1. Performance Optimization
    - Remove unused indexes from dmca_notices through licensing_terms
    - Optimizes legal compliance and licensing tables

  2. Indexes Removed
    - dmca_notices (2 indexes)
    - event_tickets (2 indexes)
    - exclusivity_declarations (2 indexes)
    - exclusivity_violations (3 indexes)
    - gdpr_requests (2 indexes)
    - instant_logins (1 index)
    - instant_payouts (2 indexes)
    - legal_agreements (1 index)
    - licensing_terms (3 indexes)
*/

-- dmca_notices
DROP INDEX IF EXISTS idx_dmca_notices_reviewed_by;
DROP INDEX IF EXISTS idx_dmca_notices_snippet_id;

-- event_tickets
DROP INDEX IF EXISTS idx_event_tickets_artist_id;
DROP INDEX IF EXISTS idx_event_tickets_buyer_id;

-- exclusivity_declarations
DROP INDEX IF EXISTS idx_exclusivity_declarations_snippet_id;
DROP INDEX IF EXISTS idx_exclusivity_declarations_user_id;

-- exclusivity_violations
DROP INDEX IF EXISTS idx_exclusivity_violations_reported_by;
DROP INDEX IF EXISTS idx_exclusivity_violations_reviewed_by;
DROP INDEX IF EXISTS idx_exclusivity_violations_snippet_id;

-- gdpr_requests
DROP INDEX IF EXISTS idx_gdpr_requests_processed_by;
DROP INDEX IF EXISTS idx_gdpr_requests_user_id;

-- instant_logins
DROP INDEX IF EXISTS idx_instant_logins_user_id;

-- instant_payouts
DROP INDEX IF EXISTS idx_instant_payouts_artist_id;
DROP INDEX IF EXISTS idx_instant_payouts_license_id;

-- legal_agreements
DROP INDEX IF EXISTS idx_legal_agreements_created_by;

-- licensing_terms
DROP INDEX IF EXISTS idx_licensing_terms_buyer_id;
DROP INDEX IF EXISTS idx_licensing_terms_license_agreement_id;
DROP INDEX IF EXISTS idx_licensing_terms_snippet_id;
