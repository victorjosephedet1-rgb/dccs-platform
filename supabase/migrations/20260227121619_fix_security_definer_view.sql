/*
  # Fix Security Definer View

  1. Security Improvement
    - Recreate financial_snapshot_view with SECURITY INVOKER
    - This ensures the view runs with caller's permissions, not creator's
    - More secure and follows principle of least privilege

  2. Changes
    - Drop existing SECURITY DEFINER view
    - Recreate with SECURITY INVOKER (default, more secure)
    - Maintains same functionality but with proper security model

  3. Impact
    - View now respects RLS policies based on the calling user
    - Prevents privilege escalation attacks
    - Users can only see data they have permission to access
*/

-- Drop the existing view
DROP VIEW IF EXISTS public.financial_snapshot_view;

-- Recreate with SECURITY INVOKER (this is the default and more secure)
CREATE VIEW public.financial_snapshot_view
WITH (security_invoker = true)
AS
SELECT 
  dc.id AS dccs_id,
  dc.creator_id,
  dc.clearance_code,
  dc.project_title,
  dc.download_unlocked,
  dc.creation_timestamp AS dccs_created_at,
  COALESCE(sum(pr.amount) FILTER (WHERE pr.status = 'completed'), 0) AS total_revenue,
  count(pr.id) FILTER (WHERE pr.status = 'completed') AS total_unlocked,
  count(pr.id) FILTER (WHERE pr.status = 'pending') AS pending_payments,
  count(pr.id) FILTER (WHERE pr.status = 'failed') AS failed_payments,
  COALESCE(sum(drp.artist_share) FILTER (WHERE drp.payout_status = 'completed'), 0) AS total_paid_out,
  COALESCE(sum(drp.artist_share) FILTER (WHERE drp.payout_status = 'pending'), 0) AS pending_payouts,
  max(pr.created_at) FILTER (WHERE pr.status = 'completed') AS last_purchase_date,
  max(drp.paid_at) AS last_payout_date,
  CASE
    WHEN dc.download_unlocked = true AND NOT EXISTS (
      SELECT 1 FROM payment_records 
      WHERE payment_records.dccs_id = dc.id 
      AND payment_records.status = 'completed'
    ) THEN 'INCONSISTENT'
    WHEN count(pr.id) FILTER (WHERE pr.status = 'completed') > 0 THEN 'ACTIVE'
    ELSE 'NO_SALES'
  END AS payout_status
FROM dccs_certificates dc
LEFT JOIN payment_records pr ON pr.dccs_id = dc.id
LEFT JOIN dccs_royalty_payments drp ON drp.clearance_code = dc.clearance_code
GROUP BY dc.id, dc.creator_id, dc.clearance_code, dc.project_title, dc.download_unlocked, dc.creation_timestamp;

-- Add comment explaining the security model
COMMENT ON VIEW public.financial_snapshot_view IS 
'Financial snapshot view with SECURITY INVOKER - respects RLS policies of the calling user for enhanced security';
