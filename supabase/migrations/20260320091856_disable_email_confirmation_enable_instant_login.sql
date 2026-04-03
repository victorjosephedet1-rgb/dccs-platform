/*
  # Disable Email Confirmation - Enable Instant Login

  1. Configuration Changes
    - Disable email confirmation requirement
    - Enable instant account access
    - Users can login immediately after registration
    - No waiting for confirmation emails

  2. Impact
    - New users: Account active immediately
    - Login: Works right away
    - Better user experience: No delays
    
  3. Security
    - Email still validated (format check)
    - Password requirements enforced
    - RLS policies active
    - Session management secure

  ## IMPORTANT: Manual Configuration Required
  
  This migration documents the required settings.
  You MUST configure these in Supabase Dashboard:
  
  Authentication > Settings:
  1. Enable email confirmations: OFF (toggle to disabled)
  2. This allows instant login without email confirmation
  
  Alternative: Use OTP codes for verification:
  1. Keep email confirmations ON
  2. Set "Confirm email" to use OTP (not magic link)
  3. OTP length: 6 digits
  4. OTP expiry: 300 seconds (5 minutes)
*/

-- =====================================================
-- UPDATE AUTH CONFIGURATION (via Dashboard)
-- =====================================================

-- This migration serves as documentation
-- Actual changes must be made in Supabase Dashboard:
-- https://supabase.com/dashboard/project/aqpvcvflwihrisjxmlfz/auth/providers

-- Settings to configure:
-- 1. Authentication > Email Provider Settings
-- 2. Toggle OFF "Enable email confirmations"
--    OR
-- 3. Change confirmation method from "Magic Link" to "OTP"

-- =====================================================
-- CREATE FUNCTION TO CHECK AUTH SETTINGS
-- =====================================================

CREATE OR REPLACE FUNCTION check_email_confirmation_status()
RETURNS TABLE (
  setting_name text,
  current_value text,
  recommended_value text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'Email Confirmation'::text as setting_name,
    'Check Dashboard'::text as current_value,
    'Disabled OR OTP-based'::text as recommended_value,
    'MANUAL_CONFIG_REQUIRED'::text as status;
END;
$$;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION check_email_confirmation_status TO authenticated;

-- =====================================================
-- NOTES FOR PLATFORM ADMINISTRATORS
-- =====================================================

-- To enable instant registration:
-- 1. Go to Supabase Dashboard
-- 2. Project Settings > Authentication
-- 3. Email Auth Provider
-- 4. Disable "Confirm email"
--
-- Users will then be able to:
-- - Register and login immediately
-- - No email confirmation wait
-- - Access platform right away
--
-- Alternative (OTP approach):
-- 1. Keep "Confirm email" enabled
-- 2. Change method to "Secure OTP"
-- 3. Users get 6-digit code in email
-- 4. Enter code to verify
-- 5. Takes ~10 seconds total

COMMENT ON FUNCTION check_email_confirmation_status IS 
'Helper function to remind administrators to configure email confirmation settings in Supabase Dashboard';
