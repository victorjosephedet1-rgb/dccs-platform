/*
  # Fix RLS Auth Performance Issues - Batch 2

  1. Performance Improvements
    - Replace auth.<function>() with (select auth.<function>()) in RLS policies
    - Fixes policies for exclusivity and AI content scanning

  2. Policies Updated
    - exclusivity_declarations: "Admins and users can view declarations"
    - exclusivity_violations: "Admins and reporters can view violations", "Admins and users can insert violations"
    - ai_content_scans: "Users and admins can view scans"
    - platform_violations: "Admins and users can view violations"
*/

-- exclusivity_declarations: Admins and users can view declarations
DROP POLICY IF EXISTS "Admins and users can view declarations" ON exclusivity_declarations;
CREATE POLICY "Admins and users can view declarations"
ON exclusivity_declarations FOR SELECT
TO authenticated
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- exclusivity_violations: Admins and reporters can view violations
DROP POLICY IF EXISTS "Admins and reporters can view violations" ON exclusivity_violations;
CREATE POLICY "Admins and reporters can view violations"
ON exclusivity_violations FOR SELECT
TO authenticated
USING (
  reported_by = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- exclusivity_violations: Admins and users can insert violations
DROP POLICY IF EXISTS "Admins and users can insert violations" ON exclusivity_violations;
CREATE POLICY "Admins and users can insert violations"
ON exclusivity_violations FOR INSERT
TO authenticated
WITH CHECK (
  reported_by = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- ai_content_scans: Users and admins can view scans
DROP POLICY IF EXISTS "Users and admins can view scans" ON ai_content_scans;
CREATE POLICY "Users and admins can view scans"
ON ai_content_scans FOR SELECT
TO authenticated
USING (
  uploaded_by = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

-- platform_violations: Admins and users can view violations
DROP POLICY IF EXISTS "Admins and users can view violations" ON platform_violations;
CREATE POLICY "Admins and users can view violations"
ON platform_violations FOR SELECT
TO authenticated
USING (
  user_id = (select auth.uid())
  OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);
