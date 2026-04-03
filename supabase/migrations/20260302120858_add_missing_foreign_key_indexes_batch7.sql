/*
  # Add Missing Foreign Key Indexes - Batch 7

  1. Performance Improvements
    - Add indexes for foreign keys in google, instant, legal tables
    - Add indexes for foreign keys in licensing and notifications

  2. Tables Affected
    - google_indexing_requests: requested_by
    - instant_logins: user_id
    - instant_payouts: artist_id, license_id
    - legal_agreements: created_by
    - licensing_terms: buyer_id, license_agreement_id, snippet_id
    - notifications: user_id
*/

-- google_indexing_requests
CREATE INDEX IF NOT EXISTS idx_google_indexing_requests_requested_by
ON google_indexing_requests(requested_by);

-- instant_logins
CREATE INDEX IF NOT EXISTS idx_instant_logins_user_id
ON instant_logins(user_id);

-- instant_payouts
CREATE INDEX IF NOT EXISTS idx_instant_payouts_artist_id
ON instant_payouts(artist_id);

CREATE INDEX IF NOT EXISTS idx_instant_payouts_license_id
ON instant_payouts(license_id);

-- legal_agreements
CREATE INDEX IF NOT EXISTS idx_legal_agreements_created_by
ON legal_agreements(created_by);

-- licensing_terms
CREATE INDEX IF NOT EXISTS idx_licensing_terms_buyer_id
ON licensing_terms(buyer_id);

CREATE INDEX IF NOT EXISTS idx_licensing_terms_license_agreement_id
ON licensing_terms(license_agreement_id);

CREATE INDEX IF NOT EXISTS idx_licensing_terms_snippet_id
ON licensing_terms(snippet_id);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
ON notifications(user_id);
