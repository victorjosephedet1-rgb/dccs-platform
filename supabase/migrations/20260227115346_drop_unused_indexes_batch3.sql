/*
  # Drop Unused Indexes - Batch 3

  1. Performance Optimization
    - Remove unused indexes from content_*, copyright_*, creator_* tables
    - These indexes add overhead without providing query benefits

  2. Indexes Removed
    - content_fingerprints (4 indexes)
    - content_moderation_flags (2 indexes)
    - copyright_claims (4 indexes)
    - creator_verification (1 index)
*/

-- content_fingerprints
DROP INDEX IF EXISTS idx_content_fingerprints_license_id;
DROP INDEX IF EXISTS idx_content_fingerprints_podcast_id;
DROP INDEX IF EXISTS idx_content_fingerprints_track_id;
DROP INDEX IF EXISTS idx_content_fingerprints_video_id;

-- content_moderation_flags
DROP INDEX IF EXISTS idx_content_moderation_flags_reviewed_by;
DROP INDEX IF EXISTS idx_content_moderation_flags_snippet_id;

-- copyright_claims
DROP INDEX IF EXISTS idx_copyright_claims_claimant_id;
DROP INDEX IF EXISTS idx_copyright_claims_resolved_by;
DROP INDEX IF EXISTS idx_copyright_claims_respondent_id;
DROP INDEX IF EXISTS idx_copyright_claims_snippet_id;

-- creator_verification
DROP INDEX IF EXISTS idx_creator_verification_verified_by;
