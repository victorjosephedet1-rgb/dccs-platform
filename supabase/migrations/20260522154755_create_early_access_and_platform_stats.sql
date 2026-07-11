/*
  # Early Access Signups + Platform Stats

  1. New Tables
    - `early_access_signups`
      - `id` (uuid, primary key)
      - `email` (text, unique, non-null)
      - `name` (text)
      - `creator_type` (text — musician, artist, filmmaker, etc.)
      - `source` (text — landing_hero, landing_cta, etc.)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled; anonymous users can INSERT only
    - No SELECT for anonymous (email privacy)
    - Authenticated users can read their own row

  3. Notes
    - Used for pre-launch/Phase 2 waitlist email capture
    - creator_type is optional — used for segmentation
*/

CREATE TABLE IF NOT EXISTS early_access_signups (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email        text NOT NULL,
  name         text DEFAULT '',
  creator_type text DEFAULT '',
  source       text DEFAULT 'landing',
  created_at   timestamptz DEFAULT now(),
  CONSTRAINT early_access_signups_email_unique UNIQUE (email)
);

ALTER TABLE early_access_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can sign up for early access"
  ON early_access_signups FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own signup"
  ON early_access_signups FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
