/*
  # Fix RLS Auth Performance Issues - Batch 3

  1. Performance Improvements
    - Replace auth.<function>() with (select auth.<function>()) in RLS policies
    - Fixes policies for DCCS royalties and disputes

  2. Policies Updated
    - dccs_royalty_payments: "Artists and buyers can view royalty payments"
    - dccs_disputes: "Admins and parties can update disputes", "Admins and parties can view disputes", "Admins and plaintiffs can insert disputes"
    - dccs_dispute_escrow: "Admins and parties can view escrow"
    - dccs_royalty_payment_audit: "Admins and artists can view audit logs"
*/

-- dccs_royalty_payments: Artists and buyers can view royalty payments
DROP POLICY IF EXISTS "Artists and buyers can view royalty payments" ON dccs_royalty_payments;
CREATE POLICY "Artists and buyers can view royalty payments"
ON dccs_royalty_payments FOR SELECT
TO authenticated
USING (
  artist_id = (select auth.uid())
  OR buyer_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- dccs_disputes: Admins and parties can update disputes
DROP POLICY IF EXISTS "Admins and parties can update disputes" ON dccs_disputes;
CREATE POLICY "Admins and parties can update disputes"
ON dccs_disputes FOR UPDATE
TO authenticated
USING (
  plaintiff_id = (select auth.uid())
  OR defendant_id = (select auth.uid())
  OR assigned_admin_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- dccs_disputes: Admins and parties can view disputes
DROP POLICY IF EXISTS "Admins and parties can view disputes" ON dccs_disputes;
CREATE POLICY "Admins and parties can view disputes"
ON dccs_disputes FOR SELECT
TO authenticated
USING (
  plaintiff_id = (select auth.uid())
  OR defendant_id = (select auth.uid())
  OR assigned_admin_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- dccs_disputes: Admins and plaintiffs can insert disputes
DROP POLICY IF EXISTS "Admins and plaintiffs can insert disputes" ON dccs_disputes;
CREATE POLICY "Admins and plaintiffs can insert disputes"
ON dccs_disputes FOR INSERT
TO authenticated
WITH CHECK (
  plaintiff_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- dccs_dispute_escrow: Admins and parties can view escrow
DROP POLICY IF EXISTS "Admins and parties can view escrow" ON dccs_dispute_escrow;
CREATE POLICY "Admins and parties can view escrow"
ON dccs_dispute_escrow FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dccs_disputes
    WHERE dccs_disputes.id = dccs_dispute_escrow.dispute_id
    AND (
      dccs_disputes.plaintiff_id = (select auth.uid())
      OR dccs_disputes.defendant_id = (select auth.uid())
      OR dccs_disputes.assigned_admin_id = (select auth.uid())
    )
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- dccs_royalty_payment_audit: Admins and artists can view audit logs
DROP POLICY IF EXISTS "Admins and artists can view audit logs" ON dccs_royalty_payment_audit;
CREATE POLICY "Admins and artists can view audit logs"
ON dccs_royalty_payment_audit FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dccs_royalty_payments
    WHERE dccs_royalty_payments.id = dccs_royalty_payment_audit.payment_id
    AND dccs_royalty_payments.artist_id = (select auth.uid())
  )
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);
