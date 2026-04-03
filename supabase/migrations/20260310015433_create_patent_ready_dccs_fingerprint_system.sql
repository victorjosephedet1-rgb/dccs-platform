/*
  # Patent-Ready DCCS Fingerprint & Verification System

  ## Overview
  This migration implements a technically sophisticated, patent-ready digital media 
  verification system with structured identifiers, enhanced fingerprinting, and 
  distortion-tolerant verification capabilities.

  ## New Tables

  ### 1. dccs_structured_identifiers
  - Stores the patent-ready structured DCCS code format
  - Format: DCCS-VXB-[YEAR]-[MEDIA_TYPE]-[FINGERPRINT_REF]-[VERSION]
  - Links to dccs_certificates for backward compatibility

  ### 2. dccs_fingerprint_data
  - Stores complete structured fingerprint objects
  - Includes spectral features, temporal signatures, and verification parameters
  - Supports multi-resolution distortion-tolerant matching

  ### 3. dccs_verification_matches
  - Logs all verification attempts and match results
  - Tracks similarity scores, confidence levels, and detected distortions
  - Enables audit trail and system performance analysis

  ### 4. dccs_distortion_profiles
  - Stores test data for distortion tolerance validation
  - Helps calibrate similarity thresholds
  - Documents system capabilities for patent claims

  ## Security
  - RLS enabled on all tables
  - Verification data is publicly readable for transparency
  - Only authenticated users can create certificates
  - Only system admins can modify verification parameters

  ## Performance
  - Indexes on all foreign keys
  - Indexes on frequently queried fields (DCCS codes, similarity scores)
  - JSONB columns for flexible fingerprint storage with GIN indexes
*/

-- 1. Create dccs_structured_identifiers table
CREATE TABLE IF NOT EXISTS dccs_structured_identifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid REFERENCES dccs_certificates(id) ON DELETE CASCADE NOT NULL,
  structured_code text UNIQUE NOT NULL,
  issuer_code text NOT NULL DEFAULT 'VXB',
  registration_year integer NOT NULL,
  media_type_code text NOT NULL,
  fingerprint_reference text NOT NULL,
  version_indicator text NOT NULL DEFAULT 'T1',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT valid_year CHECK (registration_year >= 2025 AND registration_year <= 2100),
  CONSTRAINT valid_media_type CHECK (media_type_code IN ('AUD', 'VID', 'IMG', 'DOC'))
);

-- 2. Create dccs_fingerprint_data table
CREATE TABLE IF NOT EXISTS dccs_fingerprint_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid REFERENCES dccs_certificates(id) ON DELETE CASCADE NOT NULL,
  structured_identifier_id uuid REFERENCES dccs_structured_identifiers(id) ON DELETE CASCADE,
  
  -- Complete structured fingerprint object
  fingerprint_object jsonb NOT NULL,
  
  -- Decomposed components for efficient querying
  spectral_peak_map jsonb NOT NULL,
  frequency_pair_matrix jsonb NOT NULL,
  energy_distribution jsonb NOT NULL,
  temporal_features jsonb NOT NULL,
  
  -- Verification parameters
  similarity_threshold numeric(5,2) DEFAULT 85.00 NOT NULL,
  confidence_score numeric(5,2) DEFAULT 95.00 NOT NULL,
  
  -- Processing metadata
  processing_algorithm text DEFAULT 'DCCS-FP-V1' NOT NULL,
  processing_time_ms integer,
  audio_duration_seconds numeric(10,2),
  sample_rate integer,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  
  CONSTRAINT valid_similarity_threshold CHECK (similarity_threshold >= 0 AND similarity_threshold <= 100),
  CONSTRAINT valid_confidence_score CHECK (confidence_score >= 0 AND confidence_score <= 100)
);

-- 3. Create dccs_verification_matches table
CREATE TABLE IF NOT EXISTS dccs_verification_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_request_id uuid REFERENCES dccs_verification_requests(id) ON DELETE SET NULL,
  
  -- Match details
  source_certificate_id uuid REFERENCES dccs_certificates(id) ON DELETE CASCADE,
  target_certificate_id uuid REFERENCES dccs_certificates(id) ON DELETE CASCADE NOT NULL,
  
  -- Similarity metrics
  similarity_score numeric(5,2) NOT NULL,
  confidence_level text NOT NULL,
  match_type text NOT NULL,
  
  -- Distortion detection
  distortion_detected boolean DEFAULT false NOT NULL,
  distortion_types text[] DEFAULT ARRAY[]::text[],
  transformation_parameters jsonb DEFAULT '{}'::jsonb,
  
  -- Verification metadata
  verification_method text DEFAULT 'fingerprint_comparison' NOT NULL,
  processing_time_ms integer,
  verified_at timestamptz DEFAULT now() NOT NULL,
  verified_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Geolocation (for global tracking)
  requester_ip inet,
  requester_country text,
  
  CONSTRAINT valid_similarity_score CHECK (similarity_score >= 0 AND similarity_score <= 100),
  CONSTRAINT valid_confidence_level CHECK (confidence_level IN ('very_low', 'low', 'medium', 'high', 'very_high', 'certain')),
  CONSTRAINT valid_match_type CHECK (match_type IN ('exact', 'high_confidence', 'medium_confidence', 'low_confidence', 'no_match'))
);

-- 4. Create dccs_distortion_profiles table
CREATE TABLE IF NOT EXISTS dccs_distortion_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_certificate_id uuid REFERENCES dccs_certificates(id) ON DELETE CASCADE NOT NULL,
  
  -- Distortion details
  distortion_type text NOT NULL,
  transformation_parameters jsonb NOT NULL,
  
  -- Fingerprint after distortion
  distorted_fingerprint_data jsonb NOT NULL,
  
  -- Testing metadata
  test_purpose text,
  expected_similarity_score numeric(5,2),
  actual_similarity_score numeric(5,2),
  test_passed boolean,
  
  created_for_testing_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  
  CONSTRAINT valid_distortion_type CHECK (distortion_type IN ('pitch_shift', 'speed_change', 'compression', 'noise_addition', 'eq_adjustment', 'reverb', 'combined'))
);

-- 5. Add columns to existing dccs_certificates table for structured code support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dccs_certificates' AND column_name = 'structured_code'
  ) THEN
    ALTER TABLE dccs_certificates ADD COLUMN structured_code text UNIQUE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dccs_certificates' AND column_name = 'fingerprint_version'
  ) THEN
    ALTER TABLE dccs_certificates ADD COLUMN fingerprint_version text DEFAULT 'v1';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dccs_certificates' AND column_name = 'has_enhanced_fingerprint'
  ) THEN
    ALTER TABLE dccs_certificates ADD COLUMN has_enhanced_fingerprint boolean DEFAULT false;
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_structured_identifiers_certificate ON dccs_structured_identifiers(certificate_id);
CREATE INDEX IF NOT EXISTS idx_structured_identifiers_code ON dccs_structured_identifiers(structured_code);
CREATE INDEX IF NOT EXISTS idx_structured_identifiers_year ON dccs_structured_identifiers(registration_year);
CREATE INDEX IF NOT EXISTS idx_structured_identifiers_media_type ON dccs_structured_identifiers(media_type_code);

CREATE INDEX IF NOT EXISTS idx_fingerprint_data_certificate ON dccs_fingerprint_data(certificate_id);
CREATE INDEX IF NOT EXISTS idx_fingerprint_data_identifier ON dccs_fingerprint_data(structured_identifier_id);
CREATE INDEX IF NOT EXISTS idx_fingerprint_data_algorithm ON dccs_fingerprint_data(processing_algorithm);
CREATE INDEX IF NOT EXISTS idx_fingerprint_data_created ON dccs_fingerprint_data(created_at DESC);

-- GIN indexes for JSONB columns to enable fast fingerprint searching
CREATE INDEX IF NOT EXISTS idx_fingerprint_object_gin ON dccs_fingerprint_data USING gin(fingerprint_object);
CREATE INDEX IF NOT EXISTS idx_spectral_peak_map_gin ON dccs_fingerprint_data USING gin(spectral_peak_map);

CREATE INDEX IF NOT EXISTS idx_verification_matches_source ON dccs_verification_matches(source_certificate_id);
CREATE INDEX IF NOT EXISTS idx_verification_matches_target ON dccs_verification_matches(target_certificate_id);
CREATE INDEX IF NOT EXISTS idx_verification_matches_request ON dccs_verification_matches(verification_request_id);
CREATE INDEX IF NOT EXISTS idx_verification_matches_score ON dccs_verification_matches(similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_verification_matches_verified_at ON dccs_verification_matches(verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_verification_matches_confidence ON dccs_verification_matches(confidence_level);

CREATE INDEX IF NOT EXISTS idx_distortion_profiles_original ON dccs_distortion_profiles(original_certificate_id);
CREATE INDEX IF NOT EXISTS idx_distortion_profiles_type ON dccs_distortion_profiles(distortion_type);

-- Enable RLS
ALTER TABLE dccs_structured_identifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dccs_fingerprint_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE dccs_verification_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE dccs_distortion_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dccs_structured_identifiers
CREATE POLICY "Anyone can view structured identifiers"
  ON dccs_structured_identifiers FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can create structured identifiers"
  ON dccs_structured_identifiers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for dccs_fingerprint_data
CREATE POLICY "Anyone can view fingerprint data for verification"
  ON dccs_fingerprint_data FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "System can create fingerprint data"
  ON dccs_fingerprint_data FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for dccs_verification_matches
CREATE POLICY "Anyone can view verification matches"
  ON dccs_verification_matches FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create verification matches"
  ON dccs_verification_matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for dccs_distortion_profiles
CREATE POLICY "Anyone can view distortion profiles"
  ON dccs_distortion_profiles FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can create distortion profiles"
  ON dccs_distortion_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create updated_at trigger for structured_identifiers
CREATE OR REPLACE FUNCTION update_structured_identifiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE TRIGGER update_structured_identifiers_updated_at
  BEFORE UPDATE ON dccs_structured_identifiers
  FOR EACH ROW
  EXECUTE FUNCTION update_structured_identifiers_updated_at();

-- Create function to generate structured DCCS code
CREATE OR REPLACE FUNCTION generate_structured_dccs_code(
  p_media_type text,
  p_fingerprint_hash text
)
RETURNS text AS $$
DECLARE
  v_year integer;
  v_media_code text;
  v_fingerprint_ref text;
  v_version text;
  v_structured_code text;
BEGIN
  v_year := EXTRACT(YEAR FROM now())::integer;
  
  -- Map media type to code
  v_media_code := CASE 
    WHEN p_media_type LIKE 'audio%' THEN 'AUD'
    WHEN p_media_type LIKE 'video%' THEN 'VID'
    WHEN p_media_type LIKE 'image%' THEN 'IMG'
    ELSE 'DOC'
  END;
  
  -- Use first 8 characters of fingerprint hash as reference
  v_fingerprint_ref := UPPER(substring(p_fingerprint_hash, 1, 8));
  
  -- Version indicator (T1 = Timestamp version 1)
  v_version := 'T1';
  
  -- Construct structured code
  v_structured_code := format('DCCS-VXB-%s-%s-%s-%s', 
    v_year, 
    v_media_code, 
    v_fingerprint_ref, 
    v_version
  );
  
  RETURN v_structured_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Create function to calculate confidence level from similarity score
CREATE OR REPLACE FUNCTION calculate_confidence_level(similarity_score numeric)
RETURNS text AS $$
BEGIN
  RETURN CASE
    WHEN similarity_score >= 95 THEN 'certain'
    WHEN similarity_score >= 85 THEN 'very_high'
    WHEN similarity_score >= 75 THEN 'high'
    WHEN similarity_score >= 60 THEN 'medium'
    WHEN similarity_score >= 40 THEN 'low'
    ELSE 'very_low'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- Create function to determine match type from similarity score
CREATE OR REPLACE FUNCTION determine_match_type(similarity_score numeric)
RETURNS text AS $$
BEGIN
  RETURN CASE
    WHEN similarity_score >= 95 THEN 'exact'
    WHEN similarity_score >= 85 THEN 'high_confidence'
    WHEN similarity_score >= 70 THEN 'medium_confidence'
    WHEN similarity_score >= 50 THEN 'low_confidence'
    ELSE 'no_match'
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- Create view for certificate verification status
CREATE OR REPLACE VIEW dccs_certificate_verification_status AS
SELECT 
  dc.id as certificate_id,
  dc.clearance_code,
  dc.structured_code,
  dc.has_enhanced_fingerprint,
  dsi.structured_code as full_structured_code,
  dsi.media_type_code,
  dsi.registration_year,
  dfd.id IS NOT NULL as has_fingerprint_data,
  dfd.confidence_score,
  dfd.processing_algorithm,
  COUNT(DISTINCT dvm.id) as verification_count,
  MAX(dvm.verified_at) as last_verified_at,
  AVG(dvm.similarity_score) as average_similarity_score
FROM dccs_certificates dc
LEFT JOIN dccs_structured_identifiers dsi ON dsi.certificate_id = dc.id
LEFT JOIN dccs_fingerprint_data dfd ON dfd.certificate_id = dc.id
LEFT JOIN dccs_verification_matches dvm ON dvm.target_certificate_id = dc.id
GROUP BY dc.id, dc.clearance_code, dc.structured_code, dc.has_enhanced_fingerprint,
         dsi.structured_code, dsi.media_type_code, dsi.registration_year,
         dfd.id, dfd.confidence_score, dfd.processing_algorithm;

COMMENT ON VIEW dccs_certificate_verification_status IS 
'Comprehensive view of DCCS certificate verification status including structured codes and fingerprint data';
