/*
  # Drop Unused Indexes - Batch 13

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 13: Usage snapshots, ownership, registry, IP protection

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_usage_snapshots_created_at;
DROP INDEX IF EXISTS public.idx_platform_ownership_type;
DROP INDEX IF EXISTS public.idx_data_asset_registry_type;
DROP INDEX IF EXISTS public.idx_data_asset_registry_value;
DROP INDEX IF EXISTS public.idx_ip_protection_log_action;
DROP INDEX IF EXISTS public.idx_ip_protection_log_performed_at;