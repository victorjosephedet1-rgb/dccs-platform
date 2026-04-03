/*
  # Drop Unused Indexes - Security Fix Batch 7
  
  1. Changes
    - Drops unused indexes on project_collaborators, projects
    - Drops unused indexes on royalty_agreements, royalty_audit_log
    - Drops unused indexes on upload_verification, uploads
    - Improves database performance
  
  2. Security
    - No RLS changes
    - Performance improvement only
*/

-- Drop unused indexes on project tables
DROP INDEX IF EXISTS idx_project_collaborators_user_id;
DROP INDEX IF EXISTS idx_projects_user_id;

-- Drop unused indexes on royalty tables
DROP INDEX IF EXISTS idx_royalty_agreements_artist_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_artist_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_license_id;
DROP INDEX IF EXISTS idx_royalty_audit_log_payout_id;

-- Drop unused indexes on upload tables
DROP INDEX IF EXISTS idx_upload_verification_snippet_id;
DROP INDEX IF EXISTS idx_uploads_dccs_certificate_id;
DROP INDEX IF EXISTS idx_uploads_project_id;