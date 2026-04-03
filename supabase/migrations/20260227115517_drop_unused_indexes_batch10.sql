/*
  # Drop Unused Indexes - Batch 10 (Final)

  1. Performance Optimization
    - Remove unused indexes from snippet_licenses through video_content
    - Completes removal of all unused indexes

  2. Indexes Removed
    - snippet_licenses (3 indexes)
    - track_licenses (5 indexes)
    - unified_content_fingerprints (1 index)
    - universal_transactions (1 index)
    - upload_verification (2 indexes)
    - uploads (3 indexes)
    - user_agreement_acceptances (1 index)
    - video_content (1 index)

  3. Impact
    - Total indexes removed: 130+ across all batches
    - Significant reduction in write overhead
    - Storage savings and improved maintenance
*/

-- snippet_licenses
DROP INDEX IF EXISTS idx_snippet_licenses_pack_id;
DROP INDEX IF EXISTS idx_snippet_licenses_snippet_id;
DROP INDEX IF EXISTS idx_snippet_licenses_user_id;

-- track_licenses
DROP INDEX IF EXISTS idx_track_licenses_artist_id;
DROP INDEX IF EXISTS idx_track_licenses_buyer_id;
DROP INDEX IF EXISTS idx_track_licenses_podcast_id;
DROP INDEX IF EXISTS idx_track_licenses_track_id;
DROP INDEX IF EXISTS idx_track_licenses_video_id;

-- unified_content_fingerprints
DROP INDEX IF EXISTS idx_unified_content_fingerprints_dccs_certificate_id;

-- universal_transactions
DROP INDEX IF EXISTS idx_universal_transactions_user_id;

-- upload_verification
DROP INDEX IF EXISTS idx_upload_verification_artist_id;
DROP INDEX IF EXISTS idx_upload_verification_snippet_id;

-- uploads
DROP INDEX IF EXISTS idx_uploads_dccs_certificate_id;
DROP INDEX IF EXISTS idx_uploads_project_id;
DROP INDEX IF EXISTS idx_uploads_user_id;

-- user_agreement_acceptances
DROP INDEX IF EXISTS idx_user_agreement_acceptances_agreement_id;

-- video_content
DROP INDEX IF EXISTS idx_video_content_creator_id;
