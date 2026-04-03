/*
  # Fix Security Definer View

  1. Security Fix
    - Replace SECURITY DEFINER with SECURITY INVOKER for phase1_deprecated_tables view
    - This prevents potential privilege escalation

  2. Changes
    - Drop and recreate the view with SECURITY INVOKER property
*/

-- Drop the existing view
DROP VIEW IF EXISTS phase1_deprecated_tables;

-- Recreate the view with SECURITY INVOKER (safe default)
CREATE VIEW phase1_deprecated_tables
WITH (security_invoker = true)
AS
SELECT 
  'audio_packs' as table_name,
  'Phase 1 - Basic features only' as deprecation_note,
  deprecated_at,
  phase_deprecated
FROM audio_packs
WHERE deprecated_at IS NOT NULL
UNION ALL
SELECT 
  'pack_purchases' as table_name,
  'Phase 1 - Basic features only' as deprecation_note,
  deprecated_at,
  phase_deprecated
FROM pack_purchases
WHERE deprecated_at IS NOT NULL;

-- Grant SELECT permission to authenticated users
GRANT SELECT ON phase1_deprecated_tables TO authenticated;
