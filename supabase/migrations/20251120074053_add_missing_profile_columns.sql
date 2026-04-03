/*
  # Add Missing Profile Columns

  1. Changes
    - Add `profile_slug` - unique URL-friendly slug for public profiles
    - Add `headline` - short professional headline/tagline
    - Add `location` - artist's location (city, country)
    - Add `is_profile_public` - toggle for public profile visibility
    - Add `profile_views` - counter for profile page views
    
  2. Security
    - Columns are nullable to allow gradual profile completion
    - profile_slug gets auto-generated from name if not provided
    - is_profile_public defaults to false for privacy
*/

-- Add missing profile columns
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'profile_slug'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_slug text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'headline'
  ) THEN
    ALTER TABLE profiles ADD COLUMN headline text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE profiles ADD COLUMN location text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'is_profile_public'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_profile_public boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'profile_views'
  ) THEN
    ALTER TABLE profiles ADD COLUMN profile_views integer DEFAULT 0;
  END IF;
END $$;

-- Create index for profile_slug lookups
CREATE INDEX IF NOT EXISTS idx_profiles_profile_slug ON profiles(profile_slug);

-- Function to generate profile slug from name
CREATE OR REPLACE FUNCTION generate_profile_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.profile_slug IS NULL AND NEW.name IS NOT NULL THEN
    NEW.profile_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Handle duplicates by appending random string
    WHILE EXISTS (SELECT 1 FROM profiles WHERE profile_slug = NEW.profile_slug AND id != NEW.id) LOOP
      NEW.profile_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 6);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-generate profile_slug
DROP TRIGGER IF EXISTS set_profile_slug ON profiles;
CREATE TRIGGER set_profile_slug
  BEFORE INSERT OR UPDATE OF name ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION generate_profile_slug();