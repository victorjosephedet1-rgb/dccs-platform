/*
  # Add Missing Foreign Key Indexes

  1. Performance Improvements
    - Add indexes for foreign keys without covering indexes
    - Improves query performance for joins and foreign key lookups

  2. Indexes Added
    - `dccs_ai_monitoring_log.detection_id`
    - `platform_info.updated_by`
*/

-- Add index for dccs_ai_monitoring_log.detection_id foreign key
CREATE INDEX IF NOT EXISTS idx_dccs_ai_monitoring_log_detection_id
ON public.dccs_ai_monitoring_log(detection_id);

-- Add index for platform_info.updated_by foreign key
CREATE INDEX IF NOT EXISTS idx_platform_info_updated_by
ON public.platform_info(updated_by);
