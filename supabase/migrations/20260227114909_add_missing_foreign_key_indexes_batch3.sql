/*
  # Add Missing Foreign Key Indexes - Batch 3

  1. Performance Improvements
    - Add indexes for foreign keys in dccs_dispute_activity_logs
    - Add indexes for foreign keys in dccs_dispute_cases
    - Add indexes for foreign keys in dccs_dispute_escrow
    - Add indexes for foreign keys in dccs_disputes
    - Add indexes for foreign keys in dccs_download_history

  2. Why This Matters
    - Optimizes dispute resolution system queries
    - Improves download tracking performance
*/

-- dccs_dispute_activity_logs
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_activity_logs_actor_id 
  ON dccs_dispute_activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_activity_logs_dispute_id 
  ON dccs_dispute_activity_logs(dispute_id);

-- dccs_dispute_cases
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_cases_certificate_id 
  ON dccs_dispute_cases(certificate_id);
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_cases_claimant_id 
  ON dccs_dispute_cases(claimant_id);
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_cases_resolved_by 
  ON dccs_dispute_cases(resolved_by);
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_cases_respondent_id 
  ON dccs_dispute_cases(respondent_id);

-- dccs_dispute_escrow
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_escrow_dispute_id 
  ON dccs_dispute_escrow(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_escrow_held_by_admin_id 
  ON dccs_dispute_escrow(held_by_admin_id);
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_escrow_released_by_admin_id 
  ON dccs_dispute_escrow(released_by_admin_id);

-- dccs_disputes
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_assigned_admin_id 
  ON dccs_disputes(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_certificate_id 
  ON dccs_disputes(certificate_id);
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_defendant_id 
  ON dccs_disputes(defendant_id);
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_plaintiff_id 
  ON dccs_disputes(plaintiff_id);
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_snippet_id 
  ON dccs_disputes(snippet_id);

-- dccs_download_history
CREATE INDEX IF NOT EXISTS idx_dccs_download_history_upload_id 
  ON dccs_download_history(upload_id);
CREATE INDEX IF NOT EXISTS idx_dccs_download_history_user_id 
  ON dccs_download_history(user_id);
