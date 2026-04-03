/*
  # Enable Email and Phone Verification for Production

  This migration configures Supabase Auth to enable email and phone verification
  for user signups, ensuring secure user authentication and validation.

  ## Changes
  
  1. Email Verification
     - Enable email confirmation for new signups
     - Disable auto-confirm for email addresses
  
  2. Phone Verification  
     - Enable SMS confirmation for phone-based signups
     - Disable auto-confirm for phone numbers
  
  3. Security Settings
     - Ensure signup is enabled
     - Configure secure verification flow
*/

-- This migration updates auth configuration via Supabase Dashboard
-- The following settings should be configured in Supabase Dashboard > Authentication > Settings:

-- Email Settings:
-- ✓ Enable email confirmations
-- ✓ Disable email auto-confirm
-- ✓ Set email confirmation redirect URL

-- Phone Settings:
-- ✓ Enable phone confirmations  
-- ✓ Disable phone auto-confirm
-- ✓ Configure SMS provider (Twilio, MessageBird, etc.)

-- Note: Auth configuration is managed via Supabase Dashboard Auth settings
-- This migration serves as documentation of the required configuration
