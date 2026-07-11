/*
  # Auto-Confirm All Users and Fix Email Rate Limit Issue
  
  1. Issue
    - Users are hitting email rate limits when trying to verify accounts
    - Email confirmation is still being sent despite disable_email_confirmation migration
    - Users cannot log in because emails are not confirmed
  
  2. Solution
    - Auto-confirm ALL existing users who don't have email_confirmed_at set
    - This allows immediate login without waiting for email verification
    - Prevents email rate limit errors from blocking user registration
  
  3. Security
    - Phase 1 is free and open to all creators
    - Email confirmation can be re-enabled in Phase 2 if needed
    - Users can still update their email addresses after confirmation
*/

-- Auto-confirm all users who haven't been confirmed yet
UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, now()),
  updated_at = now()
WHERE email_confirmed_at IS NULL;

-- Get count of auto-confirmed users
DO $$
DECLARE
  confirmed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO confirmed_count 
  FROM auth.users 
  WHERE email_confirmed_at IS NOT NULL;
  
  RAISE NOTICE 'Auto-confirmed users. Total confirmed users: %', confirmed_count;
END $$;

-- Ensure all users have a profile record
INSERT INTO profiles (id, email, name, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  COALESCE(u.raw_user_meta_data->>'role', 'creator'),
  u.created_at,
  now()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  updated_at = now();
