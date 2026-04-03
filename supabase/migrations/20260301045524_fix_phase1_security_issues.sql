/*
  # Fix Phase 1 Security Issues
  
  1. Security Fixes
    - Remove SECURITY DEFINER from phase1_deprecated_tables view
    - Fix overly permissive RLS policy on dccs_verification_requests
    - Add proper authentication and ownership checks
  
  2. Changes
    - Recreate view without SECURITY DEFINER
    - Replace unrestricted INSERT policy with authenticated-only policy
    - Ensure users can only create verification requests for their own content
    - Admin role checking uses 'role' column with value 'admin'
    
  3. Notes
    - Uses creator_id (correct column name in dccs_certificates)
    - Uses role = 'admin' for admin checks (profiles table structure)
*/

-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS phase1_deprecated_tables;

CREATE VIEW phase1_deprecated_tables AS
SELECT 
  'products' as table_name,
  'Will be created in Phase 2 - Marketplace' as status,
  0 as row_count
UNION ALL
SELECT 
  'product_items',
  'Will be created in Phase 2 - Marketplace',
  0
UNION ALL
SELECT 
  'licenses',
  'Will be created in Phase 2 - Licensing',
  0;

-- Fix the overly permissive RLS policy on dccs_verification_requests
DROP POLICY IF EXISTS "Anyone can create verification requests" ON dccs_verification_requests;

-- Create a secure policy that requires authentication and ownership
CREATE POLICY "Authenticated users can create verification requests for their content"
  ON dccs_verification_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_verification_requests.certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

-- Ensure users can only view their own verification requests
DROP POLICY IF EXISTS "Users can view own verification requests" ON dccs_verification_requests;

CREATE POLICY "Users can view own verification requests"
  ON dccs_verification_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = dccs_verification_requests.certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

-- Admin users can view all verification requests
DROP POLICY IF EXISTS "Admins can view all verification requests" ON dccs_verification_requests;

CREATE POLICY "Admins can view all verification requests"
  ON dccs_verification_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin users can update verification requests
DROP POLICY IF EXISTS "Admins can update verification requests" ON dccs_verification_requests;

CREATE POLICY "Admins can update verification requests"
  ON dccs_verification_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );