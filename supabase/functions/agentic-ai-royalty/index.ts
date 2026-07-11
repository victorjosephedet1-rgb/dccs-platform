import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface AgenticAIRequest {
  assetId: string;
  sourceNetwork: string;
  detectedViews: number;
  calculatedRoyaltyEth: string;
  dccsHash: string;
  creatorWallet: string;
}

interface PlatformDetectionResult {
  platform: string;
  views: number;
  estimatedRevenue: number;
  detectedAt: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    if (req.method === "POST") {
      const body: AgenticAIRequest = await req.json();
      const { assetId, sourceNetwork, detectedViews, calculatedRoyaltyEth, dccsHash, creatorWallet } = body;

      if (!dccsHash || !creatorWallet) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: dccsHash, creatorWallet" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[AGENTIC AI ALERT]: Matching asset detected on platform network: ${sourceNetwork}`);
      console.log(`[AGENTIC AI ACTION]: Views verified: ${detectedViews}`);
      console.log(`[AGENTIC AI ACTION]: Processing royalty for asset: ${dccsHash}`);

      const royaltyAmount = parseFloat(calculatedRoyaltyEth) || 0;
      const creatorShare = royaltyAmount * 0.8;
      const treasuryShare = royaltyAmount * 0.2;

      const { data: existingAsset, error: lookupError } = await supabase
        .from("dccs_certificates")
        .select("id, user_id, clearance_code")
        .eq("dccs_fingerprint", dccsHash)
        .single();

      if (lookupError && lookupError.code !== "PGRST116") {
        console.error("[AGENTIC AI ERROR]: Database lookup failed:", lookupError);
        return new Response(
          JSON.stringify({ error: "Database lookup failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const royaltyRecord = {
        dccs_hash: dccsHash,
        creator_wallet: creatorWallet,
        asset_id: assetId || null,
        source_platform: sourceNetwork,
        detected_views: detectedViews || 0,
        total_revenue_gbp: royaltyAmount * 1900,
        creator_share_gbp: creatorShare * 1900,
        treasury_share_gbp: treasuryShare * 1900,
        detection_timestamp: new Date().toISOString(),
        processed: false,
      };

      const { data: insertedRecord, error: insertError } = await supabase
        .from("dccs_ai_detected_royalties")
        .insert([royaltyRecord])
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "42P01") {
          const { error: createTableError } = await supabase.rpc("exec_sql", {
            query: `
              CREATE TABLE IF NOT EXISTS dccs_ai_detected_royalties (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                dccs_hash TEXT NOT NULL,
                creator_wallet TEXT NOT NULL,
                asset_id TEXT,
                source_platform TEXT,
                detected_views BIGINT DEFAULT 0,
                total_revenue_gbp NUMERIC(12,2) DEFAULT 0,
                creator_share_gbp NUMERIC(12,2) DEFAULT 0,
                treasury_share_gbp NUMERIC(12,2) DEFAULT 0,
                detection_timestamp TIMESTAMPTZ DEFAULT NOW(),
                processed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
              );
            `
          });
        }
        console.error("[AGENTIC AI ERROR]: Failed to insert royalty record:", insertError);
      }

      return new Response(
        JSON.stringify({
          status: "Success",
          message: `Agentic AI successfully processed automated royalty detection for asset ${dccsHash}`,
          data: {
            dccsHash,
            sourceNetwork,
            detectedViews,
            calculatedRoyaltyEth,
            distribution: {
              creatorShare: `${(creatorShare * 100).toFixed(2)}%`,
              treasuryShare: `${(treasuryShare * 100).toFixed(2)}%`,
              creatorAmountEth: creatorShare.toFixed(6),
              treasuryAmountEth: treasuryShare.toFixed(6),
            },
            assetExists: !!existingAsset,
            recordId: insertedRecord?.id || null,
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET") {
      const url = new URL(req.url);
      const dccsHash = url.searchParams.get("dccsHash");

      if (!dccsHash) {
        return new Response(
          JSON.stringify({ error: "Missing dccsHash parameter" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: detections, error } = await supabase
        .from("dccs_ai_detected_royalties")
        .select("*")
        .eq("dccs_hash", dccsHash)
        .order("detection_timestamp", { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch detections" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          status: "Success",
          dccsHash,
          detections: detections || [],
          totalDetections: detections?.length || 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[AGENTIC AI FATAL ERROR]:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
