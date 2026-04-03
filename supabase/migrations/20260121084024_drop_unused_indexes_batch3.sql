/*
  # Drop Unused Indexes - Batch 3

  ## Summary
  Final batch of unused index removal for storage and performance optimization.
  
  ## Impact
  - Reduced storage space
  - Improved write performance
  - No impact on query performance (indexes are unused)
*/

-- Exclusivity Indexes
DROP INDEX IF EXISTS idx_exclusivity_declarations_user_id;
DROP INDEX IF EXISTS idx_exclusivity_declarations_snippet_id;
DROP INDEX IF EXISTS idx_exclusivity_declarations_created_at;
DROP INDEX IF EXISTS idx_exclusivity_violations_snippet_id;
DROP INDEX IF EXISTS idx_exclusivity_violations_status;
DROP INDEX IF EXISTS idx_exclusivity_violations_created_at;
DROP INDEX IF EXISTS idx_exclusivity_violations_reported_by;
DROP INDEX IF EXISTS idx_exclusivity_violations_reviewed_by;

-- Audio Snippets Indexes
DROP INDEX IF EXISTS idx_audio_snippets_platform_exclusive;
DROP INDEX IF EXISTS idx_audio_snippets_exclusivity_verified;
DROP INDEX IF EXISTS idx_audio_snippets_exclusivity_decl;
DROP INDEX IF EXISTS idx_audio_snippets_waveform;

-- Verification Logs Indexes
DROP INDEX IF EXISTS idx_verification_logs_certificate;

-- AI and Violations Indexes
DROP INDEX IF EXISTS idx_ai_scans_user;
DROP INDEX IF EXISTS idx_ai_scans_status;
DROP INDEX IF EXISTS idx_violations_user;
DROP INDEX IF EXISTS idx_violations_severity;

-- Creator Verification Indexes
DROP INDEX IF EXISTS idx_creator_verification_user_id;
DROP INDEX IF EXISTS idx_creator_verification_level;

-- Unified Fingerprints Indexes
DROP INDEX IF EXISTS idx_unified_fingerprints_content;
DROP INDEX IF EXISTS idx_unified_fingerprints_primary;
DROP INDEX IF EXISTS idx_unified_fingerprints_dccs;
DROP INDEX IF EXISTS idx_unified_fingerprints_status;

-- Video Content Indexes
DROP INDEX IF EXISTS idx_video_content_creator_id;
DROP INDEX IF EXISTS idx_video_content_genre;
DROP INDEX IF EXISTS idx_video_content_active;
DROP INDEX IF EXISTS idx_video_content_exclusive;
DROP INDEX IF EXISTS idx_video_content_created_at;
DROP INDEX IF EXISTS idx_video_content_fingerprint;

-- Podcast Content Indexes
DROP INDEX IF EXISTS idx_podcast_content_creator_id;
DROP INDEX IF EXISTS idx_podcast_content_category;
DROP INDEX IF EXISTS idx_podcast_content_active;
DROP INDEX IF EXISTS idx_podcast_content_exclusive;
DROP INDEX IF EXISTS idx_podcast_content_created_at;
DROP INDEX IF EXISTS idx_podcast_content_series;
DROP INDEX IF EXISTS idx_podcast_content_fingerprint;
