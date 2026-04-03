/*
  # Add Missing Foreign Key Indexes - Batch 8 (Final)

  1. Performance Improvements
    - Add indexes for foreign keys in track_licenses
    - Add indexes for foreign keys in unified_content_fingerprints
    - Add indexes for foreign keys in universal_transactions
    - Add indexes for foreign keys in upload_verification
    - Add indexes for foreign keys in uploads
    - Add indexes for foreign keys in user_agreement_acceptances
    - Add indexes for foreign keys in video_content

  2. Why This Matters
    - Completes foreign key index coverage
    - Ensures optimal query performance across entire database
*/

-- track_licenses
CREATE INDEX IF NOT EXISTS idx_track_licenses_artist_id 
  ON track_licenses(artist_id);
CREATE INDEX IF NOT EXISTS idx_track_licenses_buyer_id 
  ON track_licenses(buyer_id);
CREATE INDEX IF NOT EXISTS idx_track_licenses_podcast_id 
  ON track_licenses(podcast_id);
CREATE INDEX IF NOT EXISTS idx_track_licenses_track_id 
  ON track_licenses(track_id);
CREATE INDEX IF NOT EXISTS idx_track_licenses_video_id 
  ON track_licenses(video_id);

-- unified_content_fingerprints
CREATE INDEX IF NOT EXISTS idx_unified_content_fingerprints_dccs_certificate_id 
  ON unified_content_fingerprints(dccs_certificate_id);

-- universal_transactions
CREATE INDEX IF NOT EXISTS idx_universal_transactions_user_id 
  ON universal_transactions(user_id);

-- upload_verification
CREATE INDEX IF NOT EXISTS idx_upload_verification_artist_id 
  ON upload_verification(artist_id);
CREATE INDEX IF NOT EXISTS idx_upload_verification_snippet_id 
  ON upload_verification(snippet_id);

-- uploads
CREATE INDEX IF NOT EXISTS idx_uploads_dccs_certificate_id 
  ON uploads(dccs_certificate_id);
CREATE INDEX IF NOT EXISTS idx_uploads_project_id 
  ON uploads(project_id);
CREATE INDEX IF NOT EXISTS idx_uploads_user_id 
  ON uploads(user_id);

-- user_agreement_acceptances
CREATE INDEX IF NOT EXISTS idx_user_agreement_acceptances_agreement_id 
  ON user_agreement_acceptances(agreement_id);

-- video_content
CREATE INDEX IF NOT EXISTS idx_video_content_creator_id 
  ON video_content(creator_id);
