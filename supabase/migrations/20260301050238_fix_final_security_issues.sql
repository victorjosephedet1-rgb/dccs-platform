/*
  # Fix Final Security Issues
  
  1. Security Fixes
    - Remove SECURITY DEFINER from phase1_deprecated_tables view (again - was recreated)
    - Fix RLS bypass policy on dccs_verification_requests
  
  2. Changes
    - Recreate view without SECURITY DEFINER
    - Remove overly permissive "System can update" policy
    - Ensure all updates are properly authenticated and authorized
*/

-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS phase1_deprecated_tables CASCADE;

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

-- Fix the RLS bypass policy on dccs_verification_requests
-- Remove the overly permissive "System can update" policy
DROP POLICY IF EXISTS "System can update verification requests" ON dccs_verification_requests;

-- The admin policy already exists and is sufficient for system updates
-- Only admins should be able to update verification requests
-- This is already covered by the "Admins can update verification requests" policy