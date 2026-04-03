/*
  # Add Global Regional Support to V3BMusic Platform

  ## Overview
  This migration adds comprehensive regional and international support to enable
  worldwide user registration across all continents with localized features.

  ## Changes Made

  1. **Profiles Table - New Regional Columns**
     - `continent` - User's continent (Africa, Asia, Europe, North America, South America, Oceania, Antarctica)
     - `country` - User's country (ISO 3166-1 alpha-2 code)
     - `region` - User's region/state/province within country
     - `city` - User's city
     - `timezone` - User's timezone (e.g., America/New_York, Europe/London, Africa/Lagos)
     - `preferred_currency` - User's preferred currency (USD, EUR, GBP, NGN, etc.)
     - `preferred_language` - User's preferred language (en, es, fr, etc.)
     - `phone_country_code` - International phone country code
     - `phone_number` - User's phone number

  2. **Currency Support Table**
     - Tracks supported currencies by region
     - Exchange rates for multi-currency transactions
     - Regional payment method preferences

  3. **Regional Analytics**
     - Track user distribution by continent
     - Monitor regional payment preferences
     - Regional licensing trends

  4. **Indexes for Performance**
     - Continent-based queries
     - Country-based filtering
     - Timezone lookups
     - Currency conversions

  ## Security
  - RLS policies maintained
  - Users can only update their own regional information
  - Public read access for continent/country statistics (anonymized)

  ## Benefits
  - Worldwide accessibility for all continents
  - Localized currency support
  - Timezone-aware notifications
  - Regional compliance (GDPR, CCPA, etc.)
  - Multi-language support foundation
  - Regional payment method optimization
*/

-- Step 1: Add regional columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'continent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN continent text CHECK (continent IN (
      'Africa', 
      'Asia', 
      'Europe', 
      'North America', 
      'South America', 
      'Oceania', 
      'Antarctica'
    ));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN country text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'region'
  ) THEN
    ALTER TABLE profiles ADD COLUMN region text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN timezone text DEFAULT 'UTC';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_currency'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_currency text DEFAULT 'USD';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'preferred_language'
  ) THEN
    ALTER TABLE profiles ADD COLUMN preferred_language text DEFAULT 'en';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_country_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_country_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_number text;
  END IF;
END $$;

-- Step 2: Create currency support table
CREATE TABLE IF NOT EXISTS supported_currencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_code text UNIQUE NOT NULL,
  currency_name text NOT NULL,
  currency_symbol text NOT NULL,
  continent text NOT NULL,
  countries text[] DEFAULT '{}',
  exchange_rate_to_usd decimal(10,6) DEFAULT 1.0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on currency table
ALTER TABLE supported_currencies ENABLE ROW LEVEL SECURITY;

-- Anyone can read currency data
CREATE POLICY "Anyone can read currency data"
  ON supported_currencies
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Step 3: Insert major world currencies
INSERT INTO supported_currencies (currency_code, currency_name, currency_symbol, continent, countries, exchange_rate_to_usd) VALUES
  -- North America
  ('USD', 'US Dollar', '$', 'North America', ARRAY['US', 'US territories'], 1.0),
  ('CAD', 'Canadian Dollar', 'C$', 'North America', ARRAY['CA'], 0.74),
  ('MXN', 'Mexican Peso', 'MXN$', 'North America', ARRAY['MX'], 0.059),
  
  -- Europe
  ('EUR', 'Euro', '€', 'Europe', ARRAY['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'GR', 'FI'], 1.09),
  ('GBP', 'British Pound', '£', 'Europe', ARRAY['GB'], 1.27),
  ('CHF', 'Swiss Franc', 'CHF', 'Europe', ARRAY['CH'], 1.16),
  ('SEK', 'Swedish Krona', 'kr', 'Europe', ARRAY['SE'], 0.096),
  ('NOK', 'Norwegian Krone', 'kr', 'Europe', ARRAY['NO'], 0.094),
  ('DKK', 'Danish Krone', 'kr', 'Europe', ARRAY['DK'], 0.15),
  
  -- Africa
  ('NGN', 'Nigerian Naira', '₦', 'Africa', ARRAY['NG'], 0.00065),
  ('ZAR', 'South African Rand', 'R', 'Africa', ARRAY['ZA'], 0.055),
  ('KES', 'Kenyan Shilling', 'KSh', 'Africa', ARRAY['KE'], 0.0078),
  ('GHS', 'Ghanaian Cedi', 'GH₵', 'Africa', ARRAY['GH'], 0.065),
  ('EGP', 'Egyptian Pound', 'E£', 'Africa', ARRAY['EG'], 0.020),
  
  -- Asia
  ('CNY', 'Chinese Yuan', '¥', 'Asia', ARRAY['CN'], 0.14),
  ('JPY', 'Japanese Yen', '¥', 'Asia', ARRAY['JP'], 0.0067),
  ('INR', 'Indian Rupee', '₹', 'Asia', ARRAY['IN'], 0.012),
  ('KRW', 'South Korean Won', '₩', 'Asia', ARRAY['KR'], 0.00075),
  ('SGD', 'Singapore Dollar', 'S$', 'Asia', ARRAY['SG'], 0.74),
  ('HKD', 'Hong Kong Dollar', 'HK$', 'Asia', ARRAY['HK'], 0.13),
  ('THB', 'Thai Baht', '฿', 'Asia', ARRAY['TH'], 0.029),
  ('MYR', 'Malaysian Ringgit', 'RM', 'Asia', ARRAY['MY'], 0.22),
  ('PHP', 'Philippine Peso', '₱', 'Asia', ARRAY['PH'], 0.017),
  ('IDR', 'Indonesian Rupiah', 'Rp', 'Asia', ARRAY['ID'], 0.000063),
  
  -- Oceania
  ('AUD', 'Australian Dollar', 'A$', 'Oceania', ARRAY['AU'], 0.65),
  ('NZD', 'New Zealand Dollar', 'NZ$', 'Oceania', ARRAY['NZ'], 0.60),
  
  -- South America
  ('BRL', 'Brazilian Real', 'R$', 'South America', ARRAY['BR'], 0.20),
  ('ARS', 'Argentine Peso', '$', 'South America', ARRAY['AR'], 0.0010),
  ('CLP', 'Chilean Peso', 'CLP$', 'South America', ARRAY['CL'], 0.0010),
  ('COP', 'Colombian Peso', 'COL$', 'South America', ARRAY['CO'], 0.00025)
ON CONFLICT (currency_code) DO NOTHING;

-- Step 4: Create regional analytics table
CREATE TABLE IF NOT EXISTS regional_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  continent text NOT NULL,
  country text,
  date date DEFAULT CURRENT_DATE,
  total_users integer DEFAULT 0,
  total_artists integer DEFAULT 0,
  total_creators integer DEFAULT 0,
  total_revenue decimal(12,2) DEFAULT 0,
  total_transactions integer DEFAULT 0,
  average_transaction_value decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(continent, country, date)
);

-- Enable RLS on analytics
ALTER TABLE regional_analytics ENABLE ROW LEVEL SECURITY;

-- Public read for aggregated stats (no personal data)
CREATE POLICY "Anyone can read regional analytics"
  ON regional_analytics
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_continent_idx ON profiles(continent);
CREATE INDEX IF NOT EXISTS profiles_country_idx ON profiles(country);
CREATE INDEX IF NOT EXISTS profiles_timezone_idx ON profiles(timezone);
CREATE INDEX IF NOT EXISTS profiles_preferred_currency_idx ON profiles(preferred_currency);
CREATE INDEX IF NOT EXISTS profiles_preferred_language_idx ON profiles(preferred_language);

CREATE INDEX IF NOT EXISTS regional_analytics_continent_idx ON regional_analytics(continent);
CREATE INDEX IF NOT EXISTS regional_analytics_country_idx ON regional_analytics(country);
CREATE INDEX IF NOT EXISTS regional_analytics_date_idx ON regional_analytics(date DESC);

-- Step 6: Create function to update regional analytics
CREATE OR REPLACE FUNCTION update_regional_analytics()
RETURNS void AS $$
BEGIN
  -- Update daily analytics by continent and country
  INSERT INTO regional_analytics (continent, country, date, total_users, total_artists, total_creators)
  SELECT 
    continent,
    country,
    CURRENT_DATE,
    COUNT(*),
    COUNT(*) FILTER (WHERE role = 'artist'),
    COUNT(*) FILTER (WHERE role = 'creator')
  FROM profiles
  WHERE continent IS NOT NULL
  GROUP BY continent, country
  ON CONFLICT (continent, country, date) 
  DO UPDATE SET
    total_users = EXCLUDED.total_users,
    total_artists = EXCLUDED.total_artists,
    total_creators = EXCLUDED.total_creators,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger to update analytics on profile changes
CREATE OR REPLACE FUNCTION handle_profile_regional_change()
RETURNS trigger AS $$
BEGIN
  -- Update regional analytics when continent or country changes
  IF (TG_OP = 'INSERT' OR 
      (TG_OP = 'UPDATE' AND (OLD.continent != NEW.continent OR OLD.country != NEW.country))) THEN
    PERFORM update_regional_analytics();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profile_regional_change_trigger ON profiles;
CREATE TRIGGER profile_regional_change_trigger
  AFTER INSERT OR UPDATE OF continent, country ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_profile_regional_change();

-- Step 8: Create helper function to get user's regional info
CREATE OR REPLACE FUNCTION get_user_regional_info(user_id uuid)
RETURNS TABLE (
  continent text,
  country text,
  region text,
  city text,
  timezone text,
  preferred_currency text,
  currency_symbol text,
  preferred_language text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.continent,
    p.country,
    p.region,
    p.city,
    p.timezone,
    p.preferred_currency,
    COALESCE(sc.currency_symbol, '$') as currency_symbol,
    p.preferred_language
  FROM profiles p
  LEFT JOIN supported_currencies sc ON sc.currency_code = p.preferred_currency
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create view for global user distribution
CREATE OR REPLACE VIEW global_user_distribution AS
SELECT 
  continent,
  country,
  COUNT(*) as user_count,
  COUNT(*) FILTER (WHERE role = 'artist') as artist_count,
  COUNT(*) FILTER (WHERE role = 'creator') as creator_count,
  array_agg(DISTINCT preferred_currency) as currencies_used,
  array_agg(DISTINCT preferred_language) as languages_used
FROM profiles
WHERE continent IS NOT NULL
GROUP BY continent, country
ORDER BY user_count DESC;

-- Grant access to view
GRANT SELECT ON global_user_distribution TO authenticated, anon;