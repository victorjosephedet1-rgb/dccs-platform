/*
  # Fix Critical Security Issues - Database Hardening V2

  ## Changes Applied

  ### 1. Enable RLS on All Lookup Tables
  - Enable RLS for all lookup/reference tables
  - Add read-only policies for authenticated users

  ### 2. Fix SECURITY DEFINER View
  - Recreate view without SECURITY DEFINER vulnerability

  ### 3. Fix Function Search Paths
  - Add explicit search_path to prevent SQL injection

  ## Security Improvements
  - All lookup tables now protected with RLS
  - Functions hardened against search path attacks
  - Views use security invoker pattern
*/

-- =============================================
-- 1. ENABLE RLS ON ALL LOOKUP TABLES
-- =============================================

ALTER TABLE lookup_license_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_profile_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_recipient_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_payment_method ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE lookup_platforms ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. CREATE RLS POLICIES FOR LOOKUP TABLES
-- =============================================

-- Lookup tables are read-only reference data

-- lookup_license_type
DROP POLICY IF EXISTS "Anyone can view license types" ON lookup_license_type;
CREATE POLICY "Anyone can view license types"
  ON lookup_license_type FOR SELECT
  TO authenticated
  USING (true);

-- lookup_roles
DROP POLICY IF EXISTS "Anyone can view roles" ON lookup_roles;
CREATE POLICY "Anyone can view roles"
  ON lookup_roles FOR SELECT
  TO authenticated
  USING (true);

-- lookup_profile_type
DROP POLICY IF EXISTS "Anyone can view profile types" ON lookup_profile_type;
CREATE POLICY "Anyone can view profile types"
  ON lookup_profile_type FOR SELECT
  TO authenticated
  USING (true);

-- lookup_recipient_type
DROP POLICY IF EXISTS "Anyone can view recipient types" ON lookup_recipient_type;
CREATE POLICY "Anyone can view recipient types"
  ON lookup_recipient_type FOR SELECT
  TO authenticated
  USING (true);

-- lookup_payment_method
DROP POLICY IF EXISTS "Anyone can view payment methods" ON lookup_payment_method;
CREATE POLICY "Anyone can view payment methods"
  ON lookup_payment_method FOR SELECT
  TO authenticated
  USING (true);

-- lookup_currency
DROP POLICY IF EXISTS "Anyone can view currencies" ON lookup_currency;
CREATE POLICY "Anyone can view currencies"
  ON lookup_currency FOR SELECT
  TO authenticated
  USING (true);

-- lookup_platforms
DROP POLICY IF EXISTS "Anyone can view platforms" ON lookup_platforms;
CREATE POLICY "Anyone can view platforms"
  ON lookup_platforms FOR SELECT
  TO authenticated
  USING (true);

-- =============================================
-- 3. FIX SECURITY DEFINER VIEW
-- =============================================

DROP VIEW IF EXISTS global_user_distribution;

CREATE OR REPLACE VIEW global_user_distribution
WITH (security_invoker = true)
AS
SELECT 
  p.country,
  p.region,
  COUNT(DISTINCT p.id) as user_count,
  COUNT(DISTINCT CASE WHEN p.role = 'artist' THEN p.id END) as artist_count,
  COUNT(DISTINCT CASE WHEN p.role = 'creator' THEN p.id END) as creator_count,
  COUNT(DISTINCT sl.id) as total_licenses,
  COALESCE(SUM(sl.price_paid), 0) as total_revenue
FROM profiles p
LEFT JOIN snippet_licenses sl ON sl.user_id = p.id
WHERE p.country IS NOT NULL
GROUP BY p.country, p.region
ORDER BY user_count DESC;

GRANT SELECT ON global_user_distribution TO authenticated;

-- =============================================
-- 4. FIX FUNCTION SEARCH PATHS
-- =============================================

-- Fix critical functions with explicit search_path

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'creator',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'guest');
END;
$$;

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- =============================================
-- SECURITY AUDIT FIXES COMPLETE
-- =============================================
