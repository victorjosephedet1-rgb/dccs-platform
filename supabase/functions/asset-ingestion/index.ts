import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    if (req.method === "POST") {
      const body = await req.json();
      const { fileName, fileSize, fileType, userWalletAddress, userId } = body;

      if (!fileName || !userWalletAddress) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: fileName, userWalletAddress" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const dccsHash = await computeDCCSHash(fileName, fileSize, fileType, userWalletAddress, Date.now());

      const clearanceCode = generateClearanceCode();

      return new Response(
        JSON.stringify({
          status: "Success",
          message: "Asset digital DNA hash calculated successfully",
          data: {
            dccsHash,
            clearanceCode,
            computedDccsHash: dccsHash,
            assignedSplitRule: "80% Creator / 20% DCCS Treasury",
            assetType: normalizeAssetType(fileType),
            fileName,
            userWalletAddress,
            timestamp: new Date().toISOString(),
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method === "GET") {
      const url = new URL(req.url);
      const testHash = url.searchParams.get("test");

      if (testHash) {
        const sampleHash = await computeDCCSHash("test-file.mp3", 1024000, "audio/mpeg", "0xTestWallet", Date.now());
        return new Response(
          JSON.stringify({
            status: "Success",
            sampleDccsHash: sampleHash,
            splitRule: "80% Creator / 20% DCCS Treasury",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          status: "Success",
          message: "DCCS Asset Ingestion API",
          version: "v1",
          endpoints: {
            "POST /": "Upload and compute DCCS hash for asset",
            "GET /?test=true": "Generate test DCCS hash",
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[ASSET INGESTION ERROR]:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function computeDCCSHash(
  fileName: string,
  fileSize: number,
  fileType: string,
  walletAddress: string,
  timestamp: number
): Promise<string> {
  const data = `${fileName}:${fileSize}:${fileType}:${walletAddress}:${timestamp}:${crypto.randomUUID()}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return `dccs_${hashHex.substring(0, 64)}`;
}

function generateClearanceCode(): string {
  const segments = [
    Math.random().toString(36).substring(2, 6).toUpperCase(),
    Math.random().toString(36).substring(2, 6).toUpperCase(),
    Math.random().toString(36).substring(2, 6).toUpperCase(),
    Math.random().toString(36).substring(2, 6).toUpperCase(),
  ];
  return `DCCS-${segments.join("-")}`;
}

function normalizeAssetType(fileType: string): string {
  if (!fileType) return "unknown";
  const type = fileType.toLowerCase();

  if (type.startsWith("audio/") || type.includes("mp3") || type.includes("wav") || type.includes("flac")) {
    return "audio";
  }
  if (type.startsWith("video/") || type.includes("mp4") || type.includes("mov") || type.includes("avi")) {
    return "video";
  }
  if (type.startsWith("image/") || type.includes("jpeg") || type.includes("png") || type.includes("gif")) {
    return "image";
  }
  if (type.includes("javascript") || type.includes("typescript") || type.includes("python") || type.includes("json")) {
    return "code";
  }
  if (type.includes("pdf") || type.includes("document")) {
    return "document";
  }

  return "other";
}
