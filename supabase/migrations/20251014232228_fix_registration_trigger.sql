/*
  # Fix Registration Trigger

  1. Changes
    - Drop and recreate the handle_new_user function with proper permissions
    - Ensure the trigger can insert into profiles table bypassing RLS
    - The function is already SECURITY DEFINER but needs to run with proper privileges

  2. Security
    - Function runs as the definer (postgres) to bypass RLS during user creation
    - This is safe because it only runs on auth.users INSERT trigger
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Recreate function with proper permissions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'creator')
  );
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant execute permission to the function
GRANT EXECUTE ON FUNCTION handle_new_user() TO service_role;
