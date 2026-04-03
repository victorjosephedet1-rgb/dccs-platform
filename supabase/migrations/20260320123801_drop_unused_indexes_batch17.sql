/*
  # Drop Unused Indexes - Batch 17

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 17: DCCS verification matches, distortion profiles, certificates

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_verification_matches_source;
DROP INDEX IF EXISTS public.idx_verification_matches_target;
DROP INDEX IF EXISTS public.idx_verification_matches_request;
DROP INDEX IF EXISTS public.idx_verification_matches_score;
DROP INDEX IF EXISTS public.idx_verification_matches_verified_at;
DROP INDEX IF EXISTS public.idx_verification_matches_confidence;
DROP INDEX IF EXISTS public.idx_distortion_profiles_original;
DROP INDEX IF EXISTS public.idx_distortion_profiles_type;
DROP INDEX IF EXISTS public.idx_dccs_certificates_version;
DROP INDEX IF EXISTS public.idx_dccs_certificates_hash_fragment;
DROP INDEX IF EXISTS public.idx_dccs_certificates_creator_code;
DROP INDEX IF EXISTS public.idx_dccs_certificates_creator_date;
DROP INDEX IF EXISTS public.idx_dccs_certificates_asset_type;