/*
  # Fix Multiple Permissive RLS Policies - Batch 8
  
  1. Changes
    - Consolidates policies for unified_content_fingerprints (all operations)
    - Consolidates policies for update_notifications
    - Consolidates policies for video_content (all operations)
  
  2. Security
    - Replaces multiple permissive policies with single policies
*/

-- Fix unified_content_fingerprints INSERT policies
DROP POLICY IF EXISTS "Admins have full access to fingerprints" ON unified_content_fingerprints;
DROP POLICY IF EXISTS "System can insert fingerprints" ON unified_content_fingerprints;
DROP POLICY IF EXISTS "Users can view fingerprints for their own content" ON unified_content_fingerprints;
DROP POLICY IF EXISTS "Users can update fingerprints for their own content" ON unified_content_fingerprints;

CREATE POLICY "Admins and system can insert fingerprints"
  ON unified_content_fingerprints
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Admins and owners can view fingerprints"
  ON unified_content_fingerprints
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = unified_content_fingerprints.dccs_certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

CREATE POLICY "Admins and owners can update fingerprints"
  ON unified_content_fingerprints
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = unified_content_fingerprints.dccs_certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    EXISTS (
      SELECT 1 FROM dccs_certificates
      WHERE dccs_certificates.id = unified_content_fingerprints.dccs_certificate_id
      AND dccs_certificates.creator_id = auth.uid()
    )
  );

-- Fix update_notifications policies
DROP POLICY IF EXISTS "Admins can manage update notifications" ON update_notifications;
DROP POLICY IF EXISTS "Authenticated users can view update notifications" ON update_notifications;

CREATE POLICY "All authenticated can view notifications"
  ON update_notifications
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix video_content policies
DROP POLICY IF EXISTS "Admins have full access to video content" ON video_content;
DROP POLICY IF EXISTS "Creators can delete their own video content" ON video_content;
DROP POLICY IF EXISTS "Creators can insert their own video content" ON video_content;
DROP POLICY IF EXISTS "Anyone can view active video content" ON video_content;
DROP POLICY IF EXISTS "Creators can update their own video content" ON video_content;

CREATE POLICY "Admins and creators can manage video content"
  ON video_content
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = creator_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = creator_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Anyone can view active videos"
  ON video_content
  FOR SELECT
  TO authenticated
  USING (
    is_active = true OR
    auth.uid() = creator_id OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );