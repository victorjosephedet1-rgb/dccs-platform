/*
  # Add Foreign Key Indexes - Batch 2 (Content and Copyright tables)

  1. Performance Improvements
    - Add indexes for all foreign keys in content_*, copyright_*, creator_* tables
    - Critical for content moderation and copyright claim lookups

  2. Tables Covered
    - content_fingerprints
    - content_moderation_flags
    - copyright_claims
    - creator_verification
*/

-- content_fingerprints
CREATE INDEX IF NOT EXISTS idx_content_fingerprints_license_id 
  ON content_fingerprints(license_id);
CREATE INDEX IF NOT EXISTS idx_content_fingerprints_podcast_id 
  ON content_fingerprints(podcast_id);
CREATE INDEX IF NOT EXISTS idx_content_fingerprints_track_id 
  ON content_fingerprints(track_id);
CREATE INDEX IF NOT EXISTS idx_content_fingerprints_video_id 
  ON content_fingerprints(video_id);

-- content_moderation_flags
CREATE INDEX IF NOT EXISTS idx_content_moderation_flags_reviewed_by 
  ON content_moderation_flags(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_content_moderation_flags_snippet_id 
  ON content_moderation_flags(snippet_id);

-- copyright_claims
CREATE INDEX IF NOT EXISTS idx_copyright_claims_claimant_id 
  ON copyright_claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_copyright_claims_resolved_by 
  ON copyright_claims(resolved_by);
CREATE INDEX IF NOT EXISTS idx_copyright_claims_respondent_id 
  ON copyright_claims(respondent_id);
CREATE INDEX IF NOT EXISTS idx_copyright_claims_snippet_id 
  ON copyright_claims(snippet_id);

-- creator_verification
CREATE INDEX IF NOT EXISTS idx_creator_verification_verified_by 
  ON creator_verification(verified_by);
