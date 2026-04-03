/*
  # Drop Unused Indexes - Batch 9

  1. Performance Optimization
    - Remove unused indexes from podcast_content through royalty_splits
    - Optimizes content, premium, project, and royalty tables

  2. Indexes Removed
    - podcast_content (1 index)
    - premium_subscriptions (2 indexes)
    - project_collaborators (1 index)
    - projects (1 index)
    - royalty_agreements (1 index)
    - royalty_audit_log (4 indexes)
    - royalty_payments (2 indexes)
    - royalty_splits (1 index)
*/

-- podcast_content
DROP INDEX IF EXISTS idx_podcast_content_creator_id;

-- premium_subscriptions
DROP INDEX IF EXISTS idx_premium_subscriptions_artist_id;
DROP INDEX IF EXISTS idx_premium_subscriptions_subscriber_id;

-- project_collaborators
DROP INDEX IF EXISTS idx_project_collaborators_user_id;

-- projects
DROP INDEX IF EXISTS idx_projects_user_id;

-- royalty_agreements
DROP INDEX IF EXISTS idx_royalty_agreements_artist_id;

-- royalty_audit_log
DROP INDEX IF EXISTS idx_royalty_audit_log_artist_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_license_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_payout_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_snippet_id;

-- royalty_payments
DROP INDEX IF EXISTS idx_royalty_payments_recipient_id;
DROP INDEX IF EXISTS idx_royalty_payments_split_id;

-- royalty_splits
DROP INDEX IF EXISTS idx_royalty_splits_booking_id;
