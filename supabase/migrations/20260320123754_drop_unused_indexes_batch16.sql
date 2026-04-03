/*
  # Drop Unused Indexes - Batch 16

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 16: DCCS structured identifiers, fingerprint data

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_structured_identifiers_certificate;
DROP INDEX IF EXISTS public.idx_structured_identifiers_code;
DROP INDEX IF EXISTS public.idx_structured_identifiers_year;
DROP INDEX IF EXISTS public.idx_structured_identifiers_media_type;
DROP INDEX IF EXISTS public.idx_fingerprint_data_certificate;
DROP INDEX IF EXISTS public.idx_fingerprint_data_identifier;
DROP INDEX IF EXISTS public.idx_fingerprint_data_algorithm;
DROP INDEX IF EXISTS public.idx_fingerprint_data_created;
DROP INDEX IF EXISTS public.idx_fingerprint_object_gin;
DROP INDEX IF EXISTS public.idx_spectral_peak_map_gin;