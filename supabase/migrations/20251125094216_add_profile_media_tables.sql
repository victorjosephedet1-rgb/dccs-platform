/*
  # Add Profile Media Tables for Artist Hubs
  
  1. New Tables
    - `profile_galleries`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `image_url` (text, storage path)
      - `caption` (text, optional)
      - `display_order` (integer, for sorting)
      - `is_featured` (boolean, highlight image)
      - `created_at` (timestamp)
    
    - `profile_videos`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `video_url` (text, storage path or external URL)
      - `thumbnail_url` (text, optional)
      - `title` (text)
      - `description` (text, optional)
      - `duration` (integer, in seconds)
      - `video_type` (text, 'youtube', 'vimeo', 'uploaded')
      - `display_order` (integer, for sorting)
      - `created_at` (timestamp)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for profile owners to manage their media
    - Add policies for public viewing of media from public profiles
  
  3. Indexes
    - Add indexes on profile_id for efficient queries
    - Add indexes on display_order for sorting
*/

-- Create profile_galleries table
CREATE TABLE IF NOT EXISTS profile_galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create profile_videos table
CREATE TABLE IF NOT EXISTS profile_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  thumbnail_url text,
  title text NOT NULL,
  description text,
  duration integer,
  video_type text DEFAULT 'uploaded' CHECK (video_type IN ('youtube', 'vimeo', 'uploaded')),
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profile_galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_videos ENABLE ROW LEVEL SECURITY;

-- Policies for profile_galleries
CREATE POLICY "Users can view gallery images from public profiles"
  ON profile_galleries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_galleries.profile_id
      AND profiles.is_profile_public = true
    )
  );

CREATE POLICY "Users can view their own gallery images"
  ON profile_galleries FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own gallery images"
  ON profile_galleries FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own gallery images"
  ON profile_galleries FOR UPDATE
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own gallery images"
  ON profile_galleries FOR DELETE
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

-- Policies for profile_videos
CREATE POLICY "Users can view videos from public profiles"
  ON profile_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = profile_videos.profile_id
      AND profiles.is_profile_public = true
    )
  );

CREATE POLICY "Users can view their own videos"
  ON profile_videos FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own videos"
  ON profile_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own videos"
  ON profile_videos FOR UPDATE
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own videos"
  ON profile_videos FOR DELETE
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_galleries_profile_id ON profile_galleries(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_galleries_display_order ON profile_galleries(display_order);
CREATE INDEX IF NOT EXISTS idx_profile_videos_profile_id ON profile_videos(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_videos_display_order ON profile_videos(display_order);