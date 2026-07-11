import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SIGNED_URL_EXPIRY_SECS = 3600; // 1 hour

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("cf-connecting-ip") ?? "";
  const userAgent = (req.headers.get("user-agent") ?? "").slice(0, 500);

  const logAccess = async (
    userId: string | null,
    assetId: string | null,
    bucketId: string | null,
    filePath: string | null,
    accessType: string,
    permitted: boolean,
    denialReason?: string,
    signedUrlExpiry?: string
  ) => {
    try {
      await supabaseAdmin.from("asset_access_logs").insert({
        user_id: userId,
        asset_id: assetId,
        bucket_id: bucketId,
        file_path: filePath,
        access_type: accessType,
        permitted,
        denial_reason: denialReason ?? null,
        ip_address: ip,
        user_agent: userAgent,
        signed_url_expiry: signedUrlExpiry ?? null,
      });
    } catch {
      // Non-critical — never let logging failure break a request
    }
  };

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      await logAccess(null, null, null, null, "download", false, "missing_auth_header");
      return new Response(
        JSON.stringify({ error: "Authentication required. Please log in and try again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      await logAccess(null, null, null, null, "download", false, "invalid_session");
      return new Response(
        JSON.stringify({ error: "Session expired or invalid. Please log in again." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { dccsId, bucket, filePath: directPath } = body;

    // ── Mode A: Direct asset signed URL (for uploads/profile-assets/video) ──
    if (bucket && directPath) {
      const ALLOWED_PRIVATE_BUCKETS = ["audio-files", "video-content", "profile-assets", "user-uploads", "encrypted-files"];
      if (!ALLOWED_PRIVATE_BUCKETS.includes(bucket)) {
        await logAccess(user.id, null, bucket, directPath, "signed_url_generated", false, "invalid_bucket");
        return new Response(
          JSON.stringify({ error: "Invalid bucket." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Ownership check: file path must start with user's ID folder
      const folder = directPath.split("/")[0];
      if (folder !== user.id) {
        await logAccess(user.id, null, bucket, directPath, "signed_url_generated", false, "ownership_mismatch");
        return new Response(
          JSON.stringify({ error: "Access denied. You can only access your own files." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: signed, error: signErr } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(directPath, SIGNED_URL_EXPIRY_SECS);

      if (signErr || !signed) {
        await logAccess(user.id, null, bucket, directPath, "signed_url_generated", false, signErr?.message);
        return new Response(
          JSON.stringify({ error: "Unable to generate access URL. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const expiry = new Date(Date.now() + SIGNED_URL_EXPIRY_SECS * 1000).toISOString();
      await logAccess(user.id, null, bucket, directPath, "signed_url_generated", true, undefined, expiry);

      return new Response(
        JSON.stringify({ signedUrl: signed.signedUrl, expiresIn: SIGNED_URL_EXPIRY_SECS }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Mode B: DCCS certificate download ────────────────────────────────────
    if (!dccsId) {
      return new Response(
        JSON.stringify({ error: "Invalid request. Provide dccsId or bucket + filePath." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the requesting user has download rights
    const { data: accessGranted, error: accessError } = await supabaseAdmin.rpc(
      "verify_download_access",
      { p_dccs_id: dccsId, p_user_id: user.id }
    );

    if (accessError) {
      await logAccess(user.id, dccsId, null, null, "download", false, accessError.message);
      return new Response(
        JSON.stringify({ error: "Unable to verify download permissions. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!accessGranted) {
      await logAccess(user.id, dccsId, null, null, "download", false, "access_denied");
      return new Response(
        JSON.stringify({ error: "You must be the creator of this work to download it." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve file location from certificate
    const { data: certificate, error: certError } = await supabaseAdmin
      .from("dccs_certificates")
      .select("audio_snippet_id, video_id, podcast_id")
      .eq("id", dccsId)
      .maybeSingle();

    if (certError) {
      await logAccess(user.id, dccsId, null, null, "download", false, certError.message);
      return new Response(
        JSON.stringify({ error: "Failed to retrieve certificate information. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!certificate) {
      await logAccess(user.id, dccsId, null, null, "download", false, "certificate_not_found");
      return new Response(
        JSON.stringify({ error: "DCCS certificate not found. It may have been removed." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let resolvedBucket = "";
    let resolvedPath = "";

    if (certificate.audio_snippet_id) {
      const { data: audio } = await supabaseAdmin
        .from("audio_snippets").select("file_url").eq("id", certificate.audio_snippet_id).maybeSingle();
      if (audio?.file_url) { resolvedBucket = "audio-files"; resolvedPath = audio.file_url.split("/").pop() || ""; }
    } else if (certificate.video_id) {
      const { data: video } = await supabaseAdmin
        .from("videos").select("file_url").eq("id", certificate.video_id).maybeSingle();
      if (video?.file_url) { resolvedBucket = "video-content"; resolvedPath = video.file_url.split("/").pop() || ""; }
    } else if (certificate.podcast_id) {
      const { data: podcast } = await supabaseAdmin
        .from("podcasts").select("file_url").eq("id", certificate.podcast_id).maybeSingle();
      if (podcast?.file_url) { resolvedBucket = "podcast-files"; resolvedPath = podcast.file_url.split("/").pop() || ""; }
    }

    if (!resolvedBucket || !resolvedPath) {
      await logAccess(user.id, dccsId, null, null, "download", false, "file_not_found");
      return new Response(
        JSON.stringify({ error: "The file associated with this certificate could not be located." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(resolvedBucket)
      .createSignedUrl(resolvedPath, SIGNED_URL_EXPIRY_SECS);

    if (signedUrlError || !signedUrlData) {
      await logAccess(user.id, dccsId, resolvedBucket, resolvedPath, "download", false, signedUrlError?.message);
      return new Response(
        JSON.stringify({ error: "Unable to create download link. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record download history (non-critical)
    try {
      await supabaseAdmin.from("dccs_download_history").insert({
        dccs_certificate_id: dccsId,
        user_id: user.id,
        file_path: resolvedPath,
        downloaded_at: new Date().toISOString(),
      });
    } catch { /* non-critical */ }

    const expiry = new Date(Date.now() + SIGNED_URL_EXPIRY_SECS * 1000).toISOString();
    await logAccess(user.id, dccsId, resolvedBucket, resolvedPath, "download", true, undefined, expiry);

    return new Response(
      JSON.stringify({ downloadUrl: signedUrlData.signedUrl, expiresIn: SIGNED_URL_EXPIRY_SECS }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[dccs-download-url] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again or contact support." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
