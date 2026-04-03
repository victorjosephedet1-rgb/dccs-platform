/*
  # Add Missing Foreign Key Indexes - Batch 6

  1. Performance Improvements
    - Add indexes for foreign keys in deployment, dmca, event tables
    - Add indexes for foreign keys in exclusivity and gdpr tables

  2. Tables Affected
    - deployment_logs: customer_instance_id, deployment_version_id
    - deployment_versions: deployed_by
    - dmca_notices: reviewed_by, snippet_id
    - event_tickets: artist_id, buyer_id
    - exclusivity_declarations: snippet_id, user_id
    - exclusivity_violations: reported_by, reviewed_by, snippet_id
    - gdpr_requests: processed_by, user_id
*/

-- deployment_logs
CREATE INDEX IF NOT EXISTS idx_deployment_logs_customer_instance_id
ON deployment_logs(customer_instance_id);

CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment_version_id
ON deployment_logs(deployment_version_id);

-- deployment_versions
CREATE INDEX IF NOT EXISTS idx_deployment_versions_deployed_by
ON deployment_versions(deployed_by);

-- dmca_notices
CREATE INDEX IF NOT EXISTS idx_dmca_notices_reviewed_by
ON dmca_notices(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_dmca_notices_snippet_id
ON dmca_notices(snippet_id);

-- event_tickets
CREATE INDEX IF NOT EXISTS idx_event_tickets_artist_id
ON event_tickets(artist_id);

CREATE INDEX IF NOT EXISTS idx_event_tickets_buyer_id
ON event_tickets(buyer_id);

-- exclusivity_declarations
CREATE INDEX IF NOT EXISTS idx_exclusivity_declarations_snippet_id
ON exclusivity_declarations(snippet_id);

CREATE INDEX IF NOT EXISTS idx_exclusivity_declarations_user_id
ON exclusivity_declarations(user_id);

-- exclusivity_violations
CREATE INDEX IF NOT EXISTS idx_exclusivity_violations_reported_by
ON exclusivity_violations(reported_by);

CREATE INDEX IF NOT EXISTS idx_exclusivity_violations_reviewed_by
ON exclusivity_violations(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_exclusivity_violations_snippet_id
ON exclusivity_violations(snippet_id);

-- gdpr_requests
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_processed_by
ON gdpr_requests(processed_by);

CREATE INDEX IF NOT EXISTS idx_gdpr_requests_user_id
ON gdpr_requests(user_id);
