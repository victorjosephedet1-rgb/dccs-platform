/*
  # Add Foreign Key Indexes - Batch 9 (Podcast, Premium, Projects, Royalties)

  1. Performance Improvements
    - Add indexes for content creation and royalty management tables
    - Essential for podcast/premium features and project collaboration

  2. Tables Covered
    - podcast_content
    - premium_subscriptions
    - project_collaborators
    - projects
    - royalty_agreements
    - royalty_audit_log
    - royalty_payments
    - royalty_splits
*/

-- podcast_content
CREATE INDEX IF NOT EXISTS idx_podcast_content_creator_id 
  ON podcast_content(creator_id);

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
