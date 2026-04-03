/*
  # Fix Multiple Permissive RLS Policies - Batch 3
  
  1. Changes
    - Consolidates policies for dccs_certificates
    - Consolidates policies for dccs_copyright_claims
    - Consolidates policies for dccs_dispute_escrow
    - Consolidates policies for dccs_disputes
  
  2. Security
    - Replaces multiple permissive policies with single policies
*/

-- Fix dccs_certificates SELECT policies
DROP POLICY IF EXISTS "Anyone can verify public certificates" ON dccs_certificates;
DROP POLICY IF EXISTS "Anyone can view available certificates" ON dccs_certificates;
DROP POLICY IF EXISTS "Creators can view their own certificates" ON dccs_certificates;
DROP POLICY IF EXISTS dccs_certificates_owner_read ON dccs_certificates;

CREATE POLICY "Anyone can view certificates"
  ON dccs_certificates
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix dccs_certificates UPDATE policies
DROP POLICY IF EXISTS "Creators can update their certificates" ON dccs_certificates;
DROP POLICY IF EXISTS dccs_certificates_controlled_update ON dccs_certificates;

CREATE POLICY "Creators can update own certificates"
  ON dccs_certificates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

-- Fix dccs_copyright_claims policies
DROP POLICY IF EXISTS "Admins can view all claims" ON dccs_copyright_claims;
DROP POLICY IF EXISTS "Creators can view claims for their content" ON dccs_copyright_claims;

CREATE POLICY "Admins and creators can view claims"
  ON dccs_copyright_claims
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_copyright_claims.dccs_certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

-- Fix dccs_dispute_escrow policies
DROP POLICY IF EXISTS "Admins can manage escrow" ON dccs_dispute_escrow;
DROP POLICY IF EXISTS "Users can view escrow for their disputes" ON dccs_dispute_escrow;

CREATE POLICY "Admins and parties can view escrow"
  ON dccs_dispute_escrow
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    EXISTS (
      SELECT 1 FROM dccs_disputes
      WHERE dccs_disputes.id = dccs_dispute_escrow.dispute_id
      AND (dccs_disputes.plaintiff_id = auth.uid() OR dccs_disputes.defendant_id = auth.uid())
    )
  );

-- Fix dccs_disputes INSERT policies
DROP POLICY IF EXISTS "Admins have full access to disputes" ON dccs_disputes;
DROP POLICY IF EXISTS "Plaintiffs can file disputes" ON dccs_disputes;

CREATE POLICY "Admins and plaintiffs can insert disputes"
  ON dccs_disputes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = plaintiff_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Fix dccs_disputes SELECT policies
DROP POLICY IF EXISTS "Users can view disputes where they are involved" ON dccs_disputes;

CREATE POLICY "Admins and parties can view disputes"
  ON dccs_disputes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    auth.uid() = plaintiff_id OR
    auth.uid() = defendant_id
  );

-- Fix dccs_disputes UPDATE policies
DROP POLICY IF EXISTS "Parties can update their statements" ON dccs_disputes;

CREATE POLICY "Admins and parties can update disputes"
  ON dccs_disputes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    auth.uid() = plaintiff_id OR
    auth.uid() = defendant_id
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    auth.uid() = plaintiff_id OR
    auth.uid() = defendant_id
  );