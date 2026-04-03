/*
  # Add Missing Foreign Key Indexes - Critical Performance Fix

  1. Performance Improvements
    - Add indexes for unindexed foreign keys to improve JOIN performance
    - Covers: data_asset_registry, dccs_distortion_profiles, dccs_verification_matches, ip_protection_log

  2. Changes
    - `data_asset_registry.ownership_metadata_id` - index for FK lookups
    - `dccs_distortion_profiles.created_by` - index for user FK
    - `dccs_verification_matches.verified_by` - index for user FK
    - `ip_protection_log.performed_by` - index for admin user FK
*/

-- Add missing foreign key indexes for critical tables
DO $$
BEGIN
  -- data_asset_registry: ownership_metadata_id
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'data_asset_registry' 
    AND indexname = 'idx_data_asset_registry_ownership_metadata_id'
  ) THEN
    CREATE INDEX idx_data_asset_registry_ownership_metadata_id 
    ON public.data_asset_registry(ownership_metadata_id);
  END IF;

  -- dccs_distortion_profiles: created_by
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'dccs_distortion_profiles' 
    AND indexname = 'idx_dccs_distortion_profiles_created_by'
  ) THEN
    CREATE INDEX idx_dccs_distortion_profiles_created_by 
    ON public.dccs_distortion_profiles(created_by);
  END IF;

  -- dccs_verification_matches: verified_by
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'dccs_verification_matches' 
    AND indexname = 'idx_dccs_verification_matches_verified_by'
  ) THEN
    CREATE INDEX idx_dccs_verification_matches_verified_by 
    ON public.dccs_verification_matches(verified_by);
  END IF;

  -- ip_protection_log: performed_by
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'ip_protection_log' 
    AND indexname = 'idx_ip_protection_log_performed_by'
  ) THEN
    CREATE INDEX idx_ip_protection_log_performed_by 
    ON public.ip_protection_log(performed_by);
  END IF;
END $$;