/*
  # Add Foreign Key Indexes - Batch 5 (DCCS Downloads and Royalties)

  1. Performance Improvements
    - Add indexes for all foreign keys in dccs_download_*, dccs_platform_*, dccs_royalty_* tables
    - Essential for download tracking and royalty payments

  2. Tables Covered
    - dccs_download_history
    - dccs_platform_detections
    - dccs_royalty_collections
    - dccs_royalty_payment_audit
    - dccs_royalty_payments
*/

-- dccs_download_history
CREATE INDEX IF NOT EXISTS idx_dccs_download_history_upload_id 
  ON dccs_download_history(upload_id);
CREATE INDEX IF NOT EXISTS idx_dccs_download_history_user_id 
  ON dccs_download_history(user_id);

-- dccs_platform_detections
CREATE INDEX IF NOT EXISTS idx_dccs_platform_detections_dccs_certificate_id 
  ON dccs_platform_detections(dccs_certificate_id);

-- dccs_royalty_collections
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_collections_claim_id 
  ON dccs_royalty_collections(claim_id);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_collections_dccs_certificate_id 
  ON dccs_royalty_collections(dccs_certificate_id);

-- dccs_royalty_payment_audit
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payment_audit_changed_by 
  ON dccs_royalty_payment_audit(changed_by);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payment_audit_payment_id 
  ON dccs_royalty_payment_audit(payment_id);

-- dccs_royalty_payments
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payments_artist_id 
  ON dccs_royalty_payments(artist_id);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payments_buyer_id 
  ON dccs_royalty_payments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_dccs_royalty_payments_license_id 
  ON dccs_royalty_payments(license_id);
