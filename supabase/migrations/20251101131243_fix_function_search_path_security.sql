/*
  # Fix Function Search Path Security Vulnerabilities

  1. Security Updates
    - Add SET search_path = public, pg_temp to update_updated_at_column() function
    - Add SET search_path = public, pg_temp to validate_royalty_splits() function
    - This prevents malicious users from exploiting mutable search paths
    - Ensures functions only reference objects in the public schema

  2. Functions Updated
    - `update_updated_at_column()` - Auto-update timestamps trigger function
    - `validate_royalty_splits()` - Validate royalty split percentages trigger function

  ## Security Context
  
  A mutable search_path allows attackers to create malicious objects in other schemas
  that could be called instead of the intended functions. Setting an explicit search_path
  protects against search path injection attacks.
*/

-- Fix update_updated_at_column function with secure search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger 
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix validate_royalty_splits function with secure search_path
CREATE OR REPLACE FUNCTION validate_royalty_splits()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  total numeric(10,6);
BEGIN
  SELECT COALESCE(SUM(percentage), 0) INTO total
  FROM royalty_splits
  WHERE snippet_id = NEW.snippet_id
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF (total + NEW.percentage) > 100.0001 THEN
    RAISE EXCEPTION 'Total royalty split percentage cannot exceed 100. Current sum: %, new: %', total, NEW.percentage;
  END IF;

  RETURN NEW;
END;
$$;