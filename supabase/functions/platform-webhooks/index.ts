import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const platform = url.searchParams.get("platform");

    if (!platform) {
      return new Response(
        JSON.stringify({ error: "Platform parameter required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payload = await req.json();

    if (platform === "youtube") {
      const youtubeSecret = Deno.env.get("YOUTUBE_WEBHOOK_SECRET");
      const signature = req.headers.get("X-Hub-Signature");

      if (youtubeSecret && signature) {
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(youtubeSecret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["verify"]
        );

        const payloadText = JSON.stringify(payload);
        const isValid = await crypto.subtle.verify(
          "HMAC",
          key,
          new Uint8Array(
            signature
              .split("=")[1]
              .match(/.{1,2}/g)
              ?.map((byte) => parseInt(byte, 16)) || []
          ),
          new TextEncoder().encode(payloadText)
        );

        if (!isValid) {
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (payload.entry && payload.entry.length > 0) {
        const videoId = payload.entry[0].id?.split(":video:")[1];

        if (videoId) {
          const { data: contentTracking } = await supabaseClient
            .from("content_usage_tracking")
            .select("clearance_code, content_url")
            .eq("content_id", videoId)
            .eq("platform", "youtube")
            .maybeSingle();

          if (contentTracking) {
            const syncUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/platform-sync-tracking`;
            await fetch(syncUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
              },
              body: JSON.stringify({
                action: "fetch_youtube",
                videoId: videoId,
              }),
            });

            await supabaseClient.from("artist_notifications").insert({
              type: "content_update",
              title: "Video Stats Updated",
              message: `Stats updated for video: ${contentTracking.content_url}`,
              metadata: {
                platform: "youtube",
                videoId: videoId,
                clearanceCode: contentTracking.clearance_code,
              },
            });
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: "YouTube webhook processed" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (platform === "tiktok") {
      const tiktokSecret = Deno.env.get("TIKTOK_WEBHOOK_SECRET");
      const signature = req.headers.get("X-TikTok-Signature");

      if (tiktokSecret && signature) {
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(tiktokSecret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["verify"]
        );

        const payloadText = JSON.stringify(payload);
        const isValid = await crypto.subtle.verify(
          "HMAC",
          key,
          new Uint8Array(
            signature
              .split("=")[1]
              .match(/.{1,2}/g)
              ?.map((byte) => parseInt(byte, 16)) || []
          ),
          new TextEncoder().encode(payloadText)
        );

        if (!isValid) {
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (payload.event === "video.published" && payload.video_id) {
        const { data: contentTracking } = await supabaseClient
          .from("content_usage_tracking")
          .select("clearance_code, content_url")
          .eq("content_id", payload.video_id)
          .eq("platform", "tiktok")
          .maybeSingle();

        if (contentTracking) {
          await supabaseClient.from("artist_notifications").insert({
            type: "new_content",
            title: "New TikTok Video Published",
            message: `A new video was published using your music: ${contentTracking.content_url}`,
            metadata: {
              platform: "tiktok",
              videoId: payload.video_id,
              clearanceCode: contentTracking.clearance_code,
            },
          });
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: "TikTok webhook processed" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (platform === "instagram") {
      const instagramSecret = Deno.env.get("INSTAGRAM_WEBHOOK_SECRET");
      const signature = req.headers.get("X-Hub-Signature-256");

      if (instagramSecret && signature) {
        const key = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(instagramSecret),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["verify"]
        );

        const payloadText = JSON.stringify(payload);
        const isValid = await crypto.subtle.verify(
          "HMAC",
          key,
          new Uint8Array(
            signature
              .replace("sha256=", "")
              .match(/.{1,2}/g)
              ?.map((byte) => parseInt(byte, 16)) || []
          ),
          new TextEncoder().encode(payloadText)
        );

        if (!isValid) {
          return new Response(JSON.stringify({ error: "Invalid signature" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      if (payload.entry && payload.entry.length > 0) {
        const changes = payload.entry[0].changes;
        if (changes && changes.length > 0) {
          const mediaId = changes[0].value.media_id;

          if (mediaId) {
            const { data: contentTracking } = await supabaseClient
              .from("content_usage_tracking")
              .select("clearance_code, content_url")
              .eq("content_id", mediaId)
              .eq("platform", "instagram")
              .maybeSingle();

            if (contentTracking) {
              const syncUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/platform-sync-tracking`;
              await fetch(syncUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                },
                body: JSON.stringify({
                  action: "fetch_instagram",
                  mediaId: mediaId,
                }),
              });
            }
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Instagram webhook processed",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Unsupported platform" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
