/*
  # Add Missing Foreign Key Indexes - Batch 10

  1. Performance Improvements
    - Add indexes for foreign keys in snippet, track, unified tables
    - Add indexes for foreign keys in universal, update, upload, user, video tables

  2. Tables Affected
    - snippet_licenses: pack_id, snippet_id, user_id
    - track_licenses: artist_id, buyer_id, podcast_id, track_id, video_id
    - unified_content_fingerprints: dccs_certificate_id
    - universal_transactions: user_id
    - update_notifications: customer_instance_id, deployment_version_id
    - upload_verification: artist_id, snippet_id
    - uploads: dccs_certificate_id, project_id, user_id
    - user_agreement_acceptances: agreement_id
    - video_content: creator_id
*/

-- snippet_licenses
CREATE INDEX IF NOT EXISTS idx_snippet_licenses_pack_id
ON snippet_licenses(pack_id);

CREATE INDEX IF NOT EXISTS idx_snippet_licenses_snippet_id
ON snippet_licenses(snippet_id);

CREATE INDEX IF NOT EXISTS idx_snippet_licenses_user_id
ON snippet_licenses(user_id);

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

-- update_notifications
CREATE INDEX IF NOT EXISTS idx_update_notifications_customer_instance_id
ON update_notifications(customer_instance_id);

CREATE INDEX IF NOT EXISTS idx_update_notifications_deployment_version_id
ON update_notifications(deployment_version_id);

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
