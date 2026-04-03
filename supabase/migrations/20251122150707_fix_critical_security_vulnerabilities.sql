/*
  # Fix Critical Security Vulnerabilities

  ## Overview
  This migration addresses critical security issues identified in the security audit:
  1. Fixes function search_path vulnerability in generate_profile_slug functions
  2. Documents leaked password protection (must be enabled via Supabase Dashboard)

  ## Security Fixes

  ### 1. Function Search Path Security
  - Recreates both generate_profile_slug functions with explicit search_path
  - Sets search_path to 'public' to prevent search_path injection attacks
  - Ensures functions execute with predictable schema resolution

  ### 2. Leaked Password Protection
  This must be enabled manually in Supabase Dashboard:
  - Navigate to: Authentication > Providers > Email > Password Settings
  - Enable "Check for breached passwords via HaveIBeenPwned.org"
  - This prevents users from using compromised passwords

  ## Changes Made
  - Drop and recreate both generate_profile_slug functions with secure settings
  - Set explicit search_path = public on both functions
  - Maintain SECURITY DEFINER for proper execution context
*/

-- Drop both existing functions with CASCADE to remove dependencies
DROP FUNCTION IF EXISTS public.generate_profile_slug() CASCADE;
DROP FUNCTION IF EXISTS public.generate_profile_slug(text) CASCADE;

-- Recreate trigger function with secure settings
CREATE OR REPLACE FUNCTION public.generate_profile_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Only generate slug if not provided and name exists
  IF NEW.profile_slug IS NULL AND NEW.name IS NOT NULL THEN
    -- Create base slug from name
    base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;

    -- Ensure uniqueness by appending counter if needed
    WHILE EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profile_slug = final_slug
      AND id != NEW.id
    ) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;

    NEW.profile_slug := final_slug;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate standalone function with secure settings
CREATE OR REPLACE FUNCTION public.generate_profile_slug(username text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Create base slug from username
  base_slug := lower(regexp_replace(username, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  final_slug := base_slug;

  -- Ensure uniqueness by appending counter if needed
  WHILE EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profile_slug = final_slug
  ) LOOP
    final_slug := base_slug || '-' || counter;
    counter := counter + 1;
  END LOOP;

  RETURN final_slug;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_generate_profile_slug
  BEFORE INSERT OR UPDATE OF name ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_profile_slug();

-- Add comments documenting the security configuration
COMMENT ON FUNCTION public.generate_profile_slug() IS 'Trigger function to securely generate URL-friendly slugs from profile names. Uses SECURITY DEFINER with explicit search_path to prevent injection attacks.';

COMMENT ON FUNCTION public.generate_profile_slug(text) IS 'Standalone function to securely generate unique profile slugs. Uses SECURITY DEFINER with explicit search_path to prevent injection attacks.';