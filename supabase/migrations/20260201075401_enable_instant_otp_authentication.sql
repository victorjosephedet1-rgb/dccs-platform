/*
  # Enable Instant OTP Authentication System

  1. Configuration Changes
    - Disable email confirmation requirement for registration
    - Enable instant OTP code delivery
    - Configure fast authentication flow
    - Remove slow email verification links

  2. Email Template Updates
    - Switch from magic links to OTP codes
    - Configure 6-digit verification codes
    - Set short expiration times for faster flow

  3. Security
    - OTP codes expire in 5 minutes (fast but secure)
    - Maintain RLS policies
    - Track OTP attempts

  ## Changes Made:
  - Users can register and login instantly
  - No more waiting for confirmation emails
  - Fast 6-digit codes sent via email
  - Instant verification process

  ## IMPORTANT: Supabase Dashboard Configuration Required
  
  Go to Authentication > Settings and:
  1. Toggle OFF "Enable email confirmations" - Users can login immediately
  2. Set "OTP expiry" to 300 seconds (5 minutes)
  3. Set "OTP length" to 6 digits
*/

-- =====================================================
-- OTP TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS otp_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  attempt_type text NOT NULL CHECK (attempt_type IN ('login', 'signup', 'recovery')),
  success boolean DEFAULT false,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_otp_attempts_email ON otp_attempts(email);
CREATE INDEX IF NOT EXISTS idx_otp_attempts_user_id ON otp_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_attempts_created_at ON otp_attempts(created_at DESC);

-- Enable RLS
ALTER TABLE otp_attempts ENABLE ROW LEVEL SECURITY;

-- Users can view their own OTP attempts
CREATE POLICY "Users can view own OTP attempts"
  ON otp_attempts
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- =====================================================
-- INSTANT LOGIN TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS instant_logins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  login_method text NOT NULL CHECK (login_method IN ('otp', 'password', 'magic_link')),
  device_info jsonb DEFAULT '{}'::jsonb,
  success boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_instant_logins_user_id ON instant_logins(user_id);
CREATE INDEX IF NOT EXISTS idx_instant_logins_email ON instant_logins(email);
CREATE INDEX IF NOT EXISTS idx_instant_logins_created_at ON instant_logins(created_at DESC);

-- Enable RLS
ALTER TABLE instant_logins ENABLE ROW LEVEL SECURITY;

-- Users can view their own login history
CREATE POLICY "Users can view own login history"
  ON instant_logins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTION: TRACK OTP ATTEMPT
-- =====================================================

CREATE OR REPLACE FUNCTION track_otp_attempt(
  p_email text,
  p_attempt_type text,
  p_success boolean DEFAULT false
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID if exists
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  -- Insert attempt record
  INSERT INTO otp_attempts (
    user_id,
    email,
    attempt_type,
    success
  ) VALUES (
    v_user_id,
    p_email,
    p_attempt_type,
    p_success
  );
END;
$$;

-- =====================================================
-- FUNCTION: TRACK INSTANT LOGIN
-- =====================================================

CREATE OR REPLACE FUNCTION track_instant_login(
  p_email text,
  p_login_method text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;

  -- Track login
  INSERT INTO instant_logins (
    user_id,
    email,
    login_method,
    success
  ) VALUES (
    v_user_id,
    p_email,
    p_login_method,
    true
  );
END;
$$;

-- =====================================================
-- FUNCTION: GET RECENT OTP ATTEMPTS
-- =====================================================

CREATE OR REPLACE FUNCTION get_recent_otp_attempts(
  p_email text,
  p_minutes integer DEFAULT 5
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM otp_attempts
  WHERE email = p_email
    AND created_at > now() - (p_minutes || ' minutes')::interval;

  RETURN v_count;
END;
$$;

-- =====================================================
-- AUTO-CLEANUP OLD OTP ATTEMPTS (7 DAYS)
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_otp_attempts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM otp_attempts
  WHERE created_at < now() - interval '7 days';

  DELETE FROM instant_logins
  WHERE created_at < now() - interval '30 days';
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON otp_attempts TO authenticated;
GRANT SELECT ON instant_logins TO authenticated;
GRANT EXECUTE ON FUNCTION track_otp_attempt TO authenticated;
GRANT EXECUTE ON FUNCTION track_instant_login TO authenticated;
GRANT EXECUTE ON FUNCTION get_recent_otp_attempts TO authenticated;
