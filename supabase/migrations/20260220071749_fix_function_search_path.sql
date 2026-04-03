/*
  # Fix Function Search Path Security

  1. Security Improvements
    - Set search_path on function to prevent potential security issues

  2. Functions Updated
    - update_dccs_tracking_updated_at
*/

-- Recreate function with proper search_path
CREATE OR REPLACE FUNCTION public.update_dccs_tracking_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
