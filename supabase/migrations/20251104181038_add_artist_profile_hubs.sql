/*
  # Artist & Creator Profile Hubs

  ## Overview
  This migration creates comprehensive profile hub functionality for artists and content creators,
  transforming V3BMusic.AI into a vibrant community platform where fans can discover, connect,
  and engage with their favorite artists beyond just licensing music.

  ## New Tables

  ### 1. `profile_galleries`
  Image gallery system for portfolio and press photos
  - `id` (uuid, primary key) - Unique gallery item ID
  - `profile_id` (uuid, foreign key) - Links to profiles table
  - `image_url` (text) - Storage URL for the image
  - `title` (text, nullable) - Image title/caption
  - `description` (text, nullable) - Detailed description
  - `display_order` (integer) - Sort order for display
  - `is_featured` (boolean) - Highlight on profile
  - `created_at` (timestamptz) - Upload timestamp
  - `updated_at` (timestamptz) - Last modification time

  ### 2. `profile_videos`
  Video diary, music video clips, and behind-the-scenes content
  - `id` (uuid, primary key) - Unique video entry ID
  - `profile_id` (uuid, foreign key) - Links to profiles table
  - `video_url` (text) - YouTube/Vimeo URL or direct link
  - `thumbnail_url` (text, nullable) - Custom thumbnail image
  - `title` (text) - Video title
  - `description` (text, nullable) - Video description
  - `video_type` (text) - Type: music_video, behind_scenes, vlog, teaser, performance
  - `duration` (integer, nullable) - Video length in seconds
  - `view_count` (integer) - Number of views
  - `is_featured` (boolean) - Show prominently on profile
  - `created_at` (timestamptz) - Upload/publish date
  - `updated_at` (timestamptz) - Last modification time

  ### 3. `profile_stats`
  Public-facing statistics and metrics aggregation
  - `id` (uuid, primary key) - Unique stats record ID
  - `profile_id` (uuid, foreign key, unique) - One stats record per profile
  - `total_tracks` (integer) - Total tracks uploaded
  - `total_licenses` (integer) - Total licenses sold
  - `total_plays` (integer) - Total track plays across platform
  - `total_revenue` (numeric) - Total earnings
  - `total_supporters` (integer) - Unique buyers/licensees
  - `top_genre` (text, nullable) - Most popular genre
  - `total_gallery_items` (integer) - Gallery photo count
  - `total_videos` (integer) - Video count
  - `profile_views` (integer) - Profile page visits
  - `last_active_at` (timestamptz) - Last platform activity
  - `created_at` (timestamptz) - Stats record creation
  - `updated_at` (timestamptz) - Last stats update

  ### 4. `profile_social_links`
  Social media and external links
  - `id` (uuid, primary key) - Unique link ID
  - `profile_id` (uuid, foreign key) - Links to profiles table
  - `platform` (text) - Platform name: instagram, twitter, youtube, spotify, website, etc.
  - `url` (text) - Full URL to profile/page
  - `display_order` (integer) - Sort order
  - `is_verified` (boolean) - Platform verification status
  - `created_at` (timestamptz) - Link added date

  ## Modifications to Existing Tables

  ### `profiles` table enhancements
  - `profile_slug` (text, unique) - URL-friendly username for public profile URLs
  - `headline` (text, nullable) - Short tagline/headline for profile
  - `location` (text, nullable) - City/region for artist location
  - `profile_views` (integer) - Total profile page views
  - `is_profile_public` (boolean) - Public visibility toggle

  ## Security (Row Level Security)

  ### Gallery RLS Policies
  - Artists/creators can manage their own gallery images
  - Public can view galleries from public profiles
  - Admin can view/manage all galleries

  ### Videos RLS Policies
  - Artists/creators can manage their own videos
  - Public can view videos from public profiles
  - Admin can view/manage all videos

  ### Profile Stats RLS Policies
  - Profile owners can view and update their stats
  - Public can view stats from public profiles
  - Admin can view all stats

  ### Social Links RLS Policies
  - Profile owners can manage their own social links
  - Public can view social links from public profiles
  - Admin can view/manage all links

  ## Indexes
  - Profile ID indexes on all new tables for fast lookups
  - Profile slug index for URL routing
  - Display order indexes for efficient sorting
  - Video type index for filtering
  - Platform index on social links for quick filtering

  ## Notes
  - All timestamps use `timestamptz` for timezone support
  - Default values ensure data integrity
  - Foreign keys maintain referential integrity
  - RLS ensures proper access control
  - Stats are denormalized for performance
*/

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_slug text UNIQUE,
ADD COLUMN IF NOT EXISTS headline text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS profile_views integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_profile_public boolean DEFAULT true;

-- Create index on profile_slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON profiles(profile_slug);

-- Create profile_galleries table
CREATE TABLE IF NOT EXISTS profile_galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  title text,
  description text,
  display_order integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for profile_galleries
CREATE INDEX IF NOT EXISTS idx_profile_galleries_profile_id ON profile_galleries(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_galleries_display_order ON profile_galleries(profile_id, display_order);

-- Enable RLS on profile_galleries
ALTER TABLE profile_galleries ENABLE ROW LEVEL SECURITY;

-- RLS policies for profile_galleries
CREATE POLICY "Users can view galleries from public profiles"
  ON profile_galleries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_galleries.profile_id 
      AND profiles.is_profile_public = true
    )
  );

CREATE POLICY "Users can manage own gallery"
  ON profile_galleries FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can manage all galleries"
  ON profile_galleries FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create profile_videos table
CREATE TABLE IF NOT EXISTS profile_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  thumbnail_url text,
  title text NOT NULL,
  description text,
  video_type text NOT NULL DEFAULT 'vlog',
  duration integer,
  view_count integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_video_type CHECK (
    video_type IN ('music_video', 'behind_scenes', 'vlog', 'teaser', 'performance', 'other')
  )
);

-- Create indexes for profile_videos
CREATE INDEX IF NOT EXISTS idx_profile_videos_profile_id ON profile_videos(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_videos_type ON profile_videos(video_type);

-- Enable RLS on profile_videos
ALTER TABLE profile_videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for profile_videos
CREATE POLICY "Users can view videos from public profiles"
  ON profile_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_videos.profile_id 
      AND profiles.is_profile_public = true
    )
  );

CREATE POLICY "Users can manage own videos"
  ON profile_videos FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can manage all videos"
  ON profile_videos FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create profile_stats table
CREATE TABLE IF NOT EXISTS profile_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  total_tracks integer DEFAULT 0,
  total_licenses integer DEFAULT 0,
  total_plays integer DEFAULT 0,
  total_revenue numeric DEFAULT 0.00,
  total_supporters integer DEFAULT 0,
  top_genre text,
  total_gallery_items integer DEFAULT 0,
  total_videos integer DEFAULT 0,
  profile_views integer DEFAULT 0,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for profile_stats
CREATE INDEX IF NOT EXISTS idx_profile_stats_profile_id ON profile_stats(profile_id);

-- Enable RLS on profile_stats
ALTER TABLE profile_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for profile_stats
CREATE POLICY "Users can view stats from public profiles"
  ON profile_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_stats.profile_id 
      AND profiles.is_profile_public = true
    )
  );

CREATE POLICY "Users can view and update own stats"
  ON profile_stats FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can manage all stats"
  ON profile_stats FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create profile_social_links table
CREATE TABLE IF NOT EXISTS profile_social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  platform text NOT NULL,
  url text NOT NULL,
  display_order integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_platform CHECK (
    platform IN ('instagram', 'twitter', 'facebook', 'youtube', 'spotify', 'apple_music', 
                 'soundcloud', 'tiktok', 'website', 'bandcamp', 'other')
  )
);

-- Create indexes for profile_social_links
CREATE INDEX IF NOT EXISTS idx_profile_social_links_profile_id ON profile_social_links(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_social_links_platform ON profile_social_links(platform);

-- Enable RLS on profile_social_links
ALTER TABLE profile_social_links ENABLE ROW LEVEL SECURITY;

-- RLS policies for profile_social_links
CREATE POLICY "Users can view social links from public profiles"
  ON profile_social_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = profile_social_links.profile_id 
      AND profiles.is_profile_public = true
    )
  );

CREATE POLICY "Users can manage own social links"
  ON profile_social_links FOR ALL
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can manage all social links"
  ON profile_social_links FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Function to auto-create profile_stats when a new profile is created
CREATE OR REPLACE FUNCTION create_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profile_stats (profile_id)
  VALUES (NEW.id)
  ON CONFLICT (profile_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile_stats
DROP TRIGGER IF EXISTS trigger_create_profile_stats ON profiles;
CREATE TRIGGER trigger_create_profile_stats
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_stats();

-- Function to update profile_stats when gallery items change
CREATE OR REPLACE FUNCTION update_gallery_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profile_stats
    SET total_gallery_items = total_gallery_items + 1,
        updated_at = now()
    WHERE profile_id = NEW.profile_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profile_stats
    SET total_gallery_items = GREATEST(0, total_gallery_items - 1),
        updated_at = now()
    WHERE profile_id = OLD.profile_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update gallery stats
DROP TRIGGER IF EXISTS trigger_update_gallery_stats ON profile_galleries;
CREATE TRIGGER trigger_update_gallery_stats
  AFTER INSERT OR DELETE ON profile_galleries
  FOR EACH ROW
  EXECUTE FUNCTION update_gallery_stats();

-- Function to update profile_stats when videos change
CREATE OR REPLACE FUNCTION update_video_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profile_stats
    SET total_videos = total_videos + 1,
        updated_at = now()
    WHERE profile_id = NEW.profile_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profile_stats
    SET total_videos = GREATEST(0, total_videos - 1),
        updated_at = now()
    WHERE profile_id = OLD.profile_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update video stats
DROP TRIGGER IF EXISTS trigger_update_video_stats ON profile_videos;
CREATE TRIGGER trigger_update_video_stats
  AFTER INSERT OR DELETE ON profile_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_video_stats();

-- Function to generate profile slug from name
CREATE OR REPLACE FUNCTION generate_profile_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  IF NEW.profile_slug IS NULL AND NEW.name IS NOT NULL THEN
    base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    
    WHILE EXISTS (SELECT 1 FROM profiles WHERE profile_slug = final_slug AND id != NEW.id) LOOP
      final_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.profile_slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate profile slug
DROP TRIGGER IF EXISTS trigger_generate_profile_slug ON profiles;
CREATE TRIGGER trigger_generate_profile_slug
  BEFORE INSERT OR UPDATE OF name ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_profile_slug();

-- Initialize profile_stats for existing profiles
INSERT INTO profile_stats (profile_id)
SELECT id FROM profiles
ON CONFLICT (profile_id) DO NOTHING;