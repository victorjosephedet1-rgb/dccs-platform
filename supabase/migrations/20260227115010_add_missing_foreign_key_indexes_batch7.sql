/*
  # Add Missing Foreign Key Indexes - Batch 7

  1. Performance Improvements
    - Add indexes for foreign keys in premium_subscriptions
    - Add indexes for foreign keys in project_collaborators
    - Add indexes for foreign keys in projects
    - Add indexes for foreign keys in royalty_agreements
    - Add indexes for foreign keys in royalty_audit_log
    - Add indexes for foreign keys in royalty_payments
    - Add indexes for foreign keys in royalty_splits
    - Add indexes for foreign keys in snippet_licenses

  2. Why This Matters
    - Critical for subscription management
    - Optimizes royalty calculation queries
*/

-- premium_subscriptions
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_artist_id 
  ON premium_subscriptions(artist_id);
CREATE INDEX IF NOT EXISTS idx_premium_subscriptions_subscriber_id 
  ON premium_subscriptions(subscriber_id);

-- project_collaborators
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user_id 
  ON project_collaborators(user_id);

-- projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id 
  ON projects(user_id);

-- royalty_agreements
CREATE INDEX IF NOT EXISTS idx_royalty_agreements_artist_id 
  ON royalty_agreements(artist_id);

-- royalty_audit_log
CREATE INDEX IF NOT EXISTS idx_royalty_audit_log_artist_id 
  ON royalty_audit_log(artist_id);
CREATE INDEX IF NOT EXISTS idx_royalty_audit_log_license_id 
  ON royalty_audit_log(license_id);
CREATE INDEX IF NOT EXISTS idx_royalty_audit_log_payout_id 
  ON royalty_audit_log(payout_id);
CREATE INDEX IF NOT EXISTS idx_royalty_audit_log_snippet_id 
  ON royalty_audit_log(snippet_id);

-- royalty_payments
CREATE INDEX IF NOT EXISTS idx_royalty_payments_recipient_id 
  ON royalty_payments(recipient_id);
CREATE INDEX IF NOT EXISTS idx_royalty_payments_split_id 
  ON royalty_payments(split_id);

-- royalty_splits
CREATE INDEX IF NOT EXISTS idx_royalty_splits_booking_id 
  ON royalty_splits(booking_id);

-- snippet_licenses
CREATE INDEX IF NOT EXISTS idx_snippet_licenses_pack_id 
  ON snippet_licenses(pack_id);
CREATE INDEX IF NOT EXISTS idx_snippet_licenses_snippet_id 
  ON snippet_licenses(snippet_id);
CREATE INDEX IF NOT EXISTS idx_snippet_licenses_user_id 
  ON snippet_licenses(user_id);
