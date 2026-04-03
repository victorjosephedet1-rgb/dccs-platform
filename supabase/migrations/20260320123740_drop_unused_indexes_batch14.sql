/*
  # Drop Unused Indexes - Batch 14

  1. Performance Improvements
    - Remove unused indexes to reduce storage and improve write performance
    - Batch 14: Search indexing, performance, crawl errors

  2. Changes
    - Drop indexes that have not been used
*/

DROP INDEX IF EXISTS public.idx_indexing_requests_url_status;
DROP INDEX IF EXISTS public.idx_indexing_requests_status;
DROP INDEX IF EXISTS public.idx_indexing_requests_requested_at;
DROP INDEX IF EXISTS public.idx_search_performance_url;
DROP INDEX IF EXISTS public.idx_search_performance_date;
DROP INDEX IF EXISTS public.idx_search_performance_url_date;
DROP INDEX IF EXISTS public.idx_crawl_errors_url;
DROP INDEX IF EXISTS public.idx_crawl_errors_resolved;
DROP INDEX IF EXISTS public.idx_crawl_errors_detected_at;