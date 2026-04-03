/*
  # Drop Unused Indexes - Security Fix Batch 6
  
  1. Changes
    - Drops unused indexes on content_moderation_flags, copyright_claims
    - Drops unused indexes on creator_verification, podcast_content
    - Drops unused indexes on premium_subscriptions, royalty_splits
    - Improves database performance
  
  2. Security
    - No RLS changes
    - Performance improvement only
*/

-- Drop unused indexes on content moderation and copyright
DROP INDEX IF EXISTS idx_content_moderation_flags_reviewed_by;
DROP INDEX IF EXISTS idx_content_moderation_flags_snippet_id;
DROP INDEX IF EXISTS idx_copyright_claims_claimant_id;
DROP INDEX IF EXISTS idx_copyright_claims_resolved_by;
DROP INDEX IF EXISTS idx_copyright_claims_respondent_id;
DROP INDEX IF EXISTS idx_copyright_claims_snippet_id;

-- Drop unused indexes on creator verification and podcast
DROP INDEX IF EXISTS idx_creator_verification_verified_by;
DROP INDEX IF EXISTS idx_podcast_content_creator_id;

-- Drop unused indexes on premium and royalty tables
DROP INDEX IF EXISTS idx_premium_subscriptions_artist_id;
DROP INDEX IF EXISTS idx_royalty_splits_booking_id;
DROP INDEX IF EXISTS idx_premium_subscriptions_subscriber_id;