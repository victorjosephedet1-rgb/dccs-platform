/*
  # Add Missing Foreign Key Indexes - Batch 2

  ## Summary
  Continues adding missing indexes for foreign key columns.
  
  ## Batch 2: DCCS and core platform tables (40 indexes)
*/

-- DCCS Disputes (continued)
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_defendant_id 
  ON dccs_disputes(defendant_id);

CREATE INDEX IF NOT EXISTS idx_dccs_disputes_plaintiff_id 
  ON dccs_disputes(plaintiff_id);

CREATE INDEX IF NOT EXISTS idx_dccs_disputes_snippet_id 
  ON dccs_disputes(snippet_id);

-- DCCS Royalty Payment Audit Indexes
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payment_audit_changed_by 
  ON dccs_royalty_payment_audit(changed_by);

CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payment_audit_payment_id 
  ON dccs_royalty_payment_audit(payment_id);

-- DCCS Royalty Payments Indexes
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payments_artist_id 
  ON dccs_royalty_payments(artist_id);

CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payments_buyer_id 
  ON dccs_royalty_payments(buyer_id);

CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payments_license_id 
  ON dccs_royalty_payments(license_id);

-- DCCS Split Versions Indexes
CREATE INDEX IF NOT EXISTS idx_dccs_split_versions_changed_by 
  ON dccs_split_versions(changed_by);

CREATE INDEX IF NOT EXISTS idx_dccs_split_versions_locked_by 
  ON dccs_split_versions(locked_by);

-- DCCS Verification Logs Indexes
CREATE INDEX IF NOT EXISTS idx_dccs_verification_logs_certificate_id 
  ON dccs_verification_logs(certificate_id);

-- DCCS Whitelist Evidence Indexes
CREATE INDEX IF NOT EXISTS idx_dccs_whitelist_evidence_buyer_id 
  ON dccs_whitelist_evidence(buyer_id);

CREATE INDEX IF NOT EXISTS idx_dccs_whitelist_evidence_certificate_id 
  ON dccs_whitelist_evidence(certificate_id);

CREATE INDEX IF NOT EXISTS idx_dccs_whitelist_evidence_license_id 
  ON dccs_whitelist_evidence(license_id);

-- DMCA Notices Indexes
CREATE INDEX IF NOT EXISTS idx_dmca_notices_reviewed_by 
  ON dmca_notices(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_dmca_notices_snippet_id 
  ON dmca_notices(snippet_id);

-- Event Tickets Indexes
CREATE INDEX IF NOT EXISTS idx_event_tickets_artist_id 
  ON event_tickets(artist_id);

CREATE INDEX IF NOT EXISTS idx_event_tickets_buyer_id 
  ON event_tickets(buyer_id);

-- Exclusivity Declarations Indexes
CREATE INDEX IF NOT EXISTS idx_exclusivity_declarations_snippet_id 
  ON exclusivity_declarations(snippet_id);

CREATE INDEX IF NOT EXISTS idx_exclusivity_declarations_user_id 
  ON exclusivity_declarations(user_id);

-- Exclusivity Violations Indexes
CREATE INDEX IF NOT EXISTS idx_exclusivity_violations_reported_by 
  ON exclusivity_violations(reported_by);

CREATE INDEX IF NOT EXISTS idx_exclusivity_violations_reviewed_by 
  ON exclusivity_violations(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_exclusivity_violations_snippet_id 
  ON exclusivity_violations(snippet_id);

-- GDPR Requests Indexes
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_processed_by 
  ON gdpr_requests(processed_by);

CREATE INDEX IF NOT EXISTS idx_gdpr_requests_user_id 
  ON gdpr_requests(user_id);

-- Instant Payouts Indexes
CREATE INDEX IF NOT EXISTS idx_instant_payouts_artist_id 
  ON instant_payouts(artist_id);

CREATE INDEX IF NOT EXISTS idx_instant_payouts_license_id 
  ON instant_payouts(license_id);

-- Legal Agreements Indexes
CREATE INDEX IF NOT EXISTS idx_legal_agreements_created_by 
  ON legal_agreements(created_by);

-- Licensing Terms Indexes
CREATE INDEX IF NOT EXISTS idx_licensing_terms_buyer_id 
  ON licensing_terms(buyer_id);

CREATE INDEX IF NOT EXISTS idx_licensing_terms_license_agreement_id 
  ON licensing_terms(license_agreement_id);

CREATE INDEX IF NOT EXISTS idx_licensing_terms_snippet_id 
  ON licensing_terms(snippet_id);

-- Notifications Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id 
  ON notifications(user_id);

-- Pack Purchases Indexes
CREATE INDEX IF NOT EXISTS idx_pack_purchases_pack_id 
  ON pack_purchases(pack_id);

CREATE INDEX IF NOT EXISTS idx_pack_purchases_user_id 
  ON pack_purchases(user_id);

-- Platform Revenue Indexes
CREATE INDEX IF NOT EXISTS idx_platform_revenue_artist_id 
  ON platform_revenue(artist_id);

CREATE INDEX IF NOT EXISTS idx_platform_revenue_detection_id 
  ON platform_revenue(detection_id);

CREATE INDEX IF NOT EXISTS idx_platform_revenue_license_id 
  ON platform_revenue(license_id);

CREATE INDEX IF NOT EXISTS idx_platform_revenue_payout_id 
  ON platform_revenue(payout_id);

CREATE INDEX IF NOT EXISTS idx_platform_revenue_snippet_id 
  ON platform_revenue(snippet_id);
