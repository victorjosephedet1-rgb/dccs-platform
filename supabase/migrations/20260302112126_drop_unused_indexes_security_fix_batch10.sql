/*
  # Drop Unused Indexes - Security Fix Batch 10
  
  1. Changes
    - Drops unused indexes on update_notifications
    - Drops unused indexes on upload_verification, uploads
    - Drops unused indexes on user_agreement_acceptances
    - Drops unused indexes on video_content
    - Improves database performance
  
  2. Security
    - No RLS changes
    - Performance improvement only
*/

-- Drop unused indexes on update notifications
DROP INDEX IF EXISTS idx_update_notifications_customer_instance_id;
DROP INDEX IF EXISTS idx_update_notifications_deployment_version_id;

-- Drop unused indexes on upload verification and uploads
DROP INDEX IF EXISTS idx_upload_verification_artist_id;
DROP INDEX IF EXISTS idx_uploads_user_id;

-- Drop unused indexes on user agreements and video
DROP INDEX IF EXISTS idx_user_agreement_acceptances_agreement_id;
DROP INDEX IF EXISTS idx_video_content_creator_id;