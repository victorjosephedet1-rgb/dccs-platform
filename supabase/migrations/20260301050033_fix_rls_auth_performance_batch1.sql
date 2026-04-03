/*
  # Fix RLS Auth Performance Issues - Batch 1
  
  1. Performance Improvements
    - Replace auth.uid() with (SELECT auth.uid()) in RLS policies
    - Prevents re-evaluation of auth functions for each row
    - Dramatically improves query performance at scale
  
  2. Tables Fixed (Batch 1)
    - deployment_versions
    - customer_instances
    - deployment_logs
    - update_notifications
    - profiles
*/

-- Fix deployment_versions policies
DROP POLICY IF EXISTS "Admins can manage deployment versions" ON deployment_versions;

CREATE POLICY "Admins can manage deployment versions"
  ON deployment_versions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Fix customer_instances policies
DROP POLICY IF EXISTS "Admins can manage customer instances" ON customer_instances;

CREATE POLICY "Admins can manage customer instances"
  ON customer_instances
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Fix deployment_logs policies
DROP POLICY IF EXISTS "Admins can manage deployment logs" ON deployment_logs;

CREATE POLICY "Admins can manage deployment logs"
  ON deployment_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Fix update_notifications policies
DROP POLICY IF EXISTS "Admins can manage update notifications" ON update_notifications;

CREATE POLICY "Admins can manage update notifications"
  ON update_notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can view public profiles or own profile" ON profiles;

CREATE POLICY "Users can view public profiles or own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    is_profile_public = true 
    OR id = (SELECT auth.uid())
  );