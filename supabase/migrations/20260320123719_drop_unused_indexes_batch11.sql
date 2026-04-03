/*
  # Drop Unused Indexes - Batch 11

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 11: Royalty, Snippet, Track tables

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_royalty_audit_log_snippet_id;
DROP INDEX IF EXISTS public.idx_royalty_payments_recipient_id;
DROP INDEX IF EXISTS public.idx_royalty_payments_split_id;
DROP INDEX IF EXISTS public.idx_royalty_splits_booking_id;
DROP INDEX IF EXISTS public.idx_snippet_licenses_pack_id;
DROP INDEX IF EXISTS public.idx_snippet_licenses_snippet_id;
DROP INDEX IF EXISTS public.idx_snippet_licenses_user_id;
DROP INDEX IF EXISTS public.idx_track_licenses_artist_id;
DROP INDEX IF EXISTS public.idx_track_licenses_buyer_id;
DROP INDEX IF EXISTS public.idx_track_licenses_podcast_id;
DROP INDEX IF EXISTS public.idx_track_licenses_track_id;
DROP INDEX IF EXISTS public.idx_track_licenses_video_id;