/*
  # Fix SECURITY DEFINER View - Final
  
  1. Security Fix
    - Remove SECURITY DEFINER from phase1_deprecated_tables view
    - Views should not bypass RLS unless absolutely necessary
  
  2. Changes
    - Recreate view without SECURITY DEFINER property
*/

-- Drop and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS phase1_deprecated_tables CASCADE;

CREATE OR REPLACE VIEW phase1_deprecated_tables AS
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