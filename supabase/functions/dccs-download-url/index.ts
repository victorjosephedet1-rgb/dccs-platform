import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('[DOWNLOAD] Request received');

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error('[DOWNLOAD ERROR] Missing authorization header');
      return new Response(
        JSON.stringify({
          error: "Missing authorization header",
          userMessage: "Authentication required. Please log in and try again."
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error('[DOWNLOAD ERROR] User authentication failed:', userError);
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          userMessage: "Session expired or invalid. Please log in again."
        }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('[DOWNLOAD] User authenticated:', user.id);

    const body = await req.json();
    const { dccsId } = body;

    console.log('[DOWNLOAD] Request payload:', { dccsId });

    if (!dccsId) {
      console.error('[DOWNLOAD ERROR] Missing dccsId in request');
      return new Response(
        JSON.stringify({
          error: "Missing dccsId",
          userMessage: "Invalid request. DCCS ID is required."
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('[DOWNLOAD] Verifying download access...');

    const { data: accessGranted, error: accessError } = await supabaseAdmin.rpc(
      "verify_download_access",
      {
        p_dccs_id: dccsId,
        p_user_id: user.id,
      }
    );

    if (accessError) {
      console.error('[DOWNLOAD ERROR] Access verification failed:', accessError);
      return new Response(
        JSON.stringify({
          error: "Access verification failed",
          userMessage: "Unable to verify download permissions. Please try again.",
          details: accessError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!accessGranted) {
      console.warn('[DOWNLOAD] Access denied for user:', user.id);
      return new Response(
        JSON.stringify({
          error: "Download not authorized",
          userMessage: "You must be the creator of this work to download it.",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('[DOWNLOAD] Access granted');

    console.log('[DOWNLOAD] Fetching certificate data...');

    const { data: certificate, error: certError } = await supabaseAdmin
      .from("dccs_certificates")
      .select("audio_snippet_id, video_id, podcast_id")
      .eq("id", dccsId)
      .maybeSingle();

    if (certError) {
      console.error('[DOWNLOAD ERROR] Certificate fetch failed:', certError);
      return new Response(
        JSON.stringify({
          error: "Database error",
          userMessage: "Failed to retrieve certificate information. Please try again.",
          details: certError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!certificate) {
      console.warn('[DOWNLOAD] Certificate not found:', dccsId);
      return new Response(
        JSON.stringify({
          error: "Certificate not found",
          userMessage: "DCCS certificate not found. It may have been removed."
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('[DOWNLOAD] Certificate found');

    let bucket = "";
    let filePath = "";

    if (certificate.audio_snippet_id) {
      const { data: audio } = await supabaseAdmin
        .from("audio_snippets")
        .select("file_url")
        .eq("id", certificate.audio_snippet_id)
        .maybeSingle();

      if (audio?.file_url) {
        bucket = "audio-files";
        filePath = audio.file_url.split("/").pop() || "";
      }
    } else if (certificate.video_id) {
      const { data: video } = await supabaseAdmin
        .from("videos")
        .select("file_url")
        .eq("id", certificate.video_id)
        .maybeSingle();

      if (video?.file_url) {
        bucket = "video-files";
        filePath = video.file_url.split("/").pop() || "";
      }
    } else if (certificate.podcast_id) {
      const { data: podcast } = await supabaseAdmin
        .from("podcasts")
        .select("file_url")
        .eq("id", certificate.podcast_id)
        .maybeSingle();

      if (podcast?.file_url) {
        bucket = "podcast-files";
        filePath = podcast.file_url.split("/").pop() || "";
      }
    }

    if (!bucket || !filePath) {
      console.error('[DOWNLOAD ERROR] File location not found');
      return new Response(
        JSON.stringify({
          error: "File not found",
          userMessage: "The file associated with this certificate could not be located."
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('[DOWNLOAD] Generating signed URL...', { bucket, filePath });

    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
      .storage
      .from(bucket)
      .createSignedUrl(filePath, 3600);

    if (signedUrlError) {
      console.error('[DOWNLOAD ERROR] Signed URL generation failed:', signedUrlError);
      return new Response(
        JSON.stringify({
          error: "Failed to generate download URL",
          userMessage: "Unable to create download link. Please try again.",
          details: signedUrlError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!signedUrlData) {
      console.error('[DOWNLOAD ERROR] No signed URL data returned');
      return new Response(
        JSON.stringify({
          error: "Failed to generate download URL",
          userMessage: "Unable to create download link. The file may not exist."
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('[DOWNLOAD] Signed URL generated successfully');

    console.log('[DOWNLOAD] Recording download history...');

    try {
      await supabaseAdmin
        .from("dccs_download_history")
        .insert({
          dccs_certificate_id: dccsId,
          user_id: user.id,
          file_path: filePath,
          downloaded_at: new Date().toISOString(),
        });
      console.log('[DOWNLOAD] Download history recorded');
    } catch (historyError) {
      console.warn('[DOWNLOAD] Failed to record download history (non-critical):', historyError);
    }

    console.log('[DOWNLOAD SUCCESS] Download URL generated successfully');

    return new Response(
      JSON.stringify({
        downloadUrl: signedUrlData.signedUrl,
        expiresIn: 3600,
        message: "Download URL generated successfully"
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[DOWNLOAD ERROR] Unexpected error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        error: "Download failed",
        userMessage: "An unexpected error occurred. Please try again or contact support.",
        details: errorMessage
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
