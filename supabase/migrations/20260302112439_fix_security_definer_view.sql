/*
  # Fix Security Definer View
  
  1. Changes
    - Recreates phase1_deprecated_tables view without SECURITY DEFINER
    - Uses SECURITY INVOKER instead (default and more secure)
  
  2. Security
    - Removes SECURITY DEFINER to prevent privilege escalation
    - View now runs with invoker's privileges
*/

-- Drop and recreate the view without SECURITY DEFINER
DROP VIEW IF EXISTS phase1_deprecated_tables;

CREATE VIEW phase1_deprecated_tables AS
SELECT 
  table_name,
  phase_deprecated,
  deprecated_at
FROM (
  SELECT 
    'audio_packs' as table_name,
    phase_deprecated,
    deprecated_at
  FROM audio_packs
  WHERE deprecated_at IS NOT NULL
  
  UNION ALL
  
  SELECT 
    'pack_assets' as table_name,
    'Phase 1' as phase_deprecated,
    deprecated_at
  FROM pack_assets
  WHERE deprecated_at IS NOT NULL
  
  UNION ALL
  
  SELECT 
    'pack_purchases' as table_name,
    'Phase 1' as phase_deprecated,
    deprecated_at
  FROM pack_purchases
  WHERE deprecated_at IS NOT NULL
) deprecated_info
ORDER BY deprecated_at DESC;