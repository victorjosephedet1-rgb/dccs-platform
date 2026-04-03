/*
  # Victor360 Brand Email Configuration

  1. New Table
    - `email_branding_config`
      - Stores Victor360 Brand Limited email branding and templates
      - Company information for email signatures
      - Brand colors and styling for HTML emails
      - Standard footer and legal disclaimers

  2. Security
    - Enable RLS on `email_branding_config` table
    - Public read access for system to use in email generation
    - Only admins can update branding configuration
*/

-- Create email branding configuration table
CREATE TABLE IF NOT EXISTS email_branding_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_name text UNIQUE NOT NULL,
  company_name text NOT NULL DEFAULT 'DCCS Platform by Victor360 Brand Limited',
  company_tagline text NOT NULL DEFAULT 'Digital Creative Copyright System - Instant Ownership Verification. Empowering Creators Worldwide.',
  from_name text NOT NULL DEFAULT 'DCCS Platform',
  from_email text NOT NULL DEFAULT 'noreply@dccsverify.com',
  support_email text NOT NULL DEFAULT 'support@dccsverify.com',
  brand_colors jsonb NOT NULL DEFAULT jsonb_build_object(
    'primary', '#8B5CF6',
    'secondary', '#06B6D4',
    'accent', '#10B981',
    'background', '#0F172A',
    'text', '#F8FAFC'
  ),
  logo_url text DEFAULT '/brand-assets/logo/dccs-logo.svg',
  website_url text NOT NULL DEFAULT 'https://dccsverify.com',
  social_links jsonb DEFAULT jsonb_build_object(
    'twitter', 'https://twitter.com/dccsplatform',
    'discord', 'https://discord.gg/dccsplatform',
    'linkedin', 'https://linkedin.com/company/victor360brand'
  ),
  email_footer_text text NOT NULL DEFAULT 'Copyright © 2024-2026 Victor360 Brand Limited. All rights reserved. Founded by Victor Joseph Edet - The Legacy Royalty Fixer. Patent Pending.',
  legal_disclaimer text NOT NULL DEFAULT 'This email was sent by DCCS Platform, a product of Victor360 Brand Limited. All intellectual property, concepts, and methodologies are exclusively owned by Victor Joseph Edet and Victor360 Brand Limited.',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_branding_config ENABLE ROW LEVEL SECURITY;

-- Public read access for system use
CREATE POLICY "Email branding is publicly readable"
  ON email_branding_config
  FOR SELECT
  TO public
  USING (is_active = true);

-- Only service role can update
CREATE POLICY "Only service role can update email branding"
  ON email_branding_config
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insert Victor360 Brand default configuration
INSERT INTO email_branding_config (
  config_name,
  company_name,
  company_tagline,
  from_name,
  from_email,
  support_email,
  email_footer_text,
  legal_disclaimer
) VALUES (
  'default',
  'DCCS Platform by Victor360 Brand Limited',
  'Digital Creative Copyright System - Instant Ownership Verification. Empowering Creators Worldwide.',
  'DCCS Platform',
  'noreply@dccsverify.com',
  'support@dccsverify.com',
  'Copyright © 2024-2026 Victor360 Brand Limited. All rights reserved. Founded by Victor Joseph Edet - The Legacy Royalty Fixer. Patent Pending. Unauthorized use, copying, or replication is strictly prohibited.',
  'This email was sent by DCCS Platform, developed by Victor360 Brand Limited. DCCS is the world''s first Digital Creation Certificate System - revolutionizing digital asset protection with cryptographic fingerprinting, instant verification, and blockchain-verified proof of ownership. All intellectual property is exclusively owned by Victor Joseph Edet and Victor360 Brand Limited.'
) ON CONFLICT (config_name) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  company_tagline = EXCLUDED.company_tagline,
  updated_at = now();

-- Create index for quick lookups
CREATE INDEX IF NOT EXISTS idx_email_branding_config_active 
  ON email_branding_config(config_name) 
  WHERE is_active = true;
