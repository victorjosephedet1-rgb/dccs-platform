/*
  # Update Platform Terminology - Sound Engineers & Music Artists

  ## Platform User Hierarchy
  1. **Sound Engineers** (Primary Creators)
     - Upload beats, instrumentals, and audio snippets
     - Set licensing terms and pricing
     - Receive 80% of all royalties (lifetime)
  
  2. **Music Artists** (Licensees/Buyers)
     - License audio from Sound Engineers
     - Use in their own productions
     - Content tracked via DCCS for ongoing royalties
  
  ## Updates
  - Add comments clarifying Sound Engineers vs Music Artists
  - Update table descriptions
  - Maintain existing column names for consistency
  
  ## No Breaking Changes
  - All existing artist_id columns remain unchanged
  - All existing RLS policies remain unchanged
  - Only updating documentation and comments
*/

-- Update table comments to reflect Sound Engineer terminology
COMMENT ON TABLE profiles IS 
'User profiles. Role "artist" refers to Sound Engineers who upload content. Role "buyer" refers to Music Artists who license content.';

COMMENT ON TABLE audio_snippets IS 
'Audio content uploaded by Sound Engineers (beats, instrumentals, loops). Licensed by Music Artists for use in productions.';

COMMENT ON TABLE track_licenses IS 
'Licenses purchased by Music Artists from Sound Engineers. Each license includes a unique DCCS clearance code for lifetime royalty tracking.';

COMMENT ON TABLE dccs_royalty_payments IS 
'Ongoing royalty payments tracked via DCCS. Sound Engineers receive 80% of all performance royalties. Platform receives 20%. Lifetime contract.';

COMMENT ON TABLE royalty_agreements IS 
'Lifetime 80/20 royalty agreements. All Sound Engineers automatically receive this agreement upon registration. Terms are immutable and lifetime-guaranteed.';

COMMENT ON TABLE platform_usage_tracking IS 
'Tracks where Music Artists use licensed content across platforms (YouTube, TikTok, etc). Generates ongoing royalties for Sound Engineers via DCCS.';

COMMENT ON TABLE content_fingerprints IS 
'Digital fingerprints for all audio created by Sound Engineers. Used by DCCS to track usage and generate ongoing royalties.';

-- Update column comments
COMMENT ON COLUMN dccs_royalty_payments.artist_id IS 
'Sound Engineer who created the original content and receives 80% of ongoing royalties';

COMMENT ON COLUMN dccs_royalty_payments.buyer_id IS 
'Music Artist who licensed the content and is using it in their productions';

COMMENT ON COLUMN dccs_royalty_payments.artist_share IS 
'Amount paid to Sound Engineer (80% of gross royalties)';

COMMENT ON COLUMN track_licenses.artist_id IS 
'Sound Engineer who created and is licensing this content';

COMMENT ON COLUMN track_licenses.buyer_id IS 
'Music Artist who purchased the license';

COMMENT ON COLUMN audio_snippets.artist_id IS 
'Sound Engineer who uploaded this audio content';

COMMENT ON COLUMN royalty_agreements.artist_id IS 
'Sound Engineer covered by this lifetime 80/20 royalty agreement';

COMMENT ON COLUMN platform_usage_tracking.license_id IS 
'License showing which Music Artist is using which Sound Engineer content';

-- Update function comments
COMMENT ON FUNCTION process_dccs_ongoing_royalties() IS 
'Processes ongoing royalties from DCCS-verified content. Sound Engineers receive 80% of all performance-based royalties. Music Artists generate these royalties when they use licensed content across platforms.';

COMMENT ON FUNCTION sync_platform_usage_dccs(text, text, text, bigint, bigint, jsonb) IS 
'Syncs platform usage data when Music Artists use licensed content. Generates ongoing royalties for Sound Engineers through DCCS clearance code tracking.';

COMMENT ON FUNCTION create_royalty_agreement_for_artist() IS 
'Auto-creates lifetime 80/20 royalty agreement when Sound Engineer registers. Agreement is immutable and guarantees 80% of all revenue for life.';

COMMENT ON FUNCTION get_lifetime_royalty_guarantee(uuid) IS 
'Returns lifetime royalty agreement details for a Sound Engineer. Shows 80/20 split guarantee and lifetime earnings tracking.';
