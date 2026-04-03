/*
  # Fix Security Definer Views (Now Truly Final)

  1. Security Improvements
    - Replace SECURITY DEFINER views with SECURITY INVOKER
    - Uses only existing columns

  2. Changes
    - Drop and recreate views with SECURITY INVOKER
*/

-- Drop existing views
DROP VIEW IF EXISTS public.dccs_certificate_verification_status;
DROP VIEW IF EXISTS public.investor_data_assets;

-- Recreate dccs_certificate_verification_status with SECURITY INVOKER
CREATE VIEW public.dccs_certificate_verification_status
WITH (security_invoker = true)
AS
SELECT 
  c.id,
  c.certificate_id,
  c.clearance_code,
  c.creator_id,
  c.creation_timestamp as created_at,
  COUNT(DISTINCT vm.id) as verification_count,
  MAX(vm.verified_at) as last_verified_at,
  AVG(vm.similarity_score) as avg_similarity_score
FROM public.dccs_certificates c
LEFT JOIN public.dccs_verification_matches vm ON vm.target_certificate_id = c.id
GROUP BY c.id, c.certificate_id, c.clearance_code, c.creator_id, c.creation_timestamp;

-- Recreate investor_data_assets with SECURITY INVOKER
CREATE VIEW public.investor_data_assets
WITH (security_invoker = true)
AS
SELECT 
  dar.id,
  dar.asset_type,
  dar.asset_value_category,
  dar.business_value,
  dar.investor_relevance,
  dar.created_at,
  pom.owner_entity
FROM public.data_asset_registry dar
JOIN public.platform_ownership_metadata pom ON pom.id = dar.ownership_metadata_id
WHERE pom.owner_entity = 'Victor360 Brand Limited';