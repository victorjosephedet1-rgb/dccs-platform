import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationPayload {
  artistId: string;
  type: "new_content" | "royalty_earned" | "content_update" | "milestone_reached" | "copyright_alert";
  title: string;
  message: string;
  metadata?: Record<string, any>;
  priority?: "low" | "medium" | "high" | "urgent";
}

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

    const { action } = await req.json();

    if (action === "send_notification") {
      const payload: NotificationPayload = await req.json();

      const { data: artistProfile } = await supabaseClient
        .from("profiles")
        .select("email, name, notification_preferences")
        .eq("id", payload.artistId)
        .maybeSingle();

      if (!artistProfile) {
        return new Response(
          JSON.stringify({ error: "Artist not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { error: insertError } = await supabaseClient
        .from("artist_notifications")
        .insert({
          artist_id: payload.artistId,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          priority: payload.priority || "medium",
          metadata: payload.metadata || {},
          is_read: false,
        });

      if (insertError) {
        throw insertError;
      }

      const notificationPrefs = artistProfile.notification_preferences || {
        email: true,
        push: true,
      };

      if (notificationPrefs.email) {
        console.log(
          `Email notification sent to ${artistProfile.email}: ${payload.title}`
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Notification sent successfully",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (action === "check_new_content") {
      const { data: recentContent } = await supabaseClient
        .from("content_usage_tracking")
        .select(`
          *,
          digital_clearance_codes!inner(
            artist_id,
            track_id,
            audio_snippets!inner(
              title,
              profiles!inner(
                id,
                name,
                email
              )
            )
          )
        `)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false });

      if (recentContent && recentContent.length > 0) {
        const notificationsByArtist = new Map<string, any[]>();

        for (const content of recentContent) {
          const artistId = content.digital_clearance_codes.artist_id;
          if (!notificationsByArtist.has(artistId)) {
            notificationsByArtist.set(artistId, []);
          }
          notificationsByArtist.get(artistId)?.push(content);
        }

        for (const [artistId, contents] of notificationsByArtist) {
          const trackNames = [
            ...new Set(
              contents.map(
                (c) => c.digital_clearance_codes.audio_snippets.title
              )
            ),
          ];

          await supabaseClient.from("artist_notifications").insert({
            artist_id: artistId,
            type: "new_content",
            title: "Your Music is Being Used!",
            message: `${contents.length} new content piece(s) created using your tracks: ${trackNames.join(", ")}`,
            priority: "high",
            metadata: {
              contentCount: contents.length,
              tracks: trackNames,
              platforms: [...new Set(contents.map((c) => c.platform))],
            },
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `Processed ${recentContent.length} new content notifications`,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else if (action === "check_royalty_milestones") {
      const { data: royaltyData } = await supabaseClient
        .from("digital_clearance_codes")
        .select("artist_id, track_id, total_royalties_earned, total_views")
        .gte("total_royalties_earned", 100);

      if (royaltyData && royaltyData.length > 0) {
        for (const data of royaltyData) {
          const milestones = [
            { amount: 100, message: "Congratulations! You've earned your first $100!" },
            { amount: 500, message: "Amazing! You've reached $500 in royalties!" },
            { amount: 1000, message: "Milestone Alert! $1,000 earned from this track!" },
            { amount: 5000, message: "Incredible! $5,000 in royalties!" },
            { amount: 10000, message: "You're a superstar! $10,000 earned!" },
          ];

          const reachedMilestone = milestones.find(
            (m) =>
              data.total_royalties_earned >= m.amount &&
              data.total_royalties_earned < m.amount + 100
          );

          if (reachedMilestone) {
            await supabaseClient.from("artist_notifications").insert({
              artist_id: data.artist_id,
              type: "milestone_reached",
              title: "Royalty Milestone Reached!",
              message: reachedMilestone.message,
              priority: "high",
              metadata: {
                trackId: data.track_id,
                totalEarned: data.total_royalties_earned,
                totalViews: data.total_views,
              },
            });
          }
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Milestone notifications processed",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (action === "get_artist_notifications") {
      const { artistId, limit = 50 } = await req.json();

      const { data: notifications, error } = await supabaseClient
        .from("artist_notifications")
        .select("*")
        .eq("artist_id", artistId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({
          success: true,
          notifications: notifications || [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (action === "mark_as_read") {
      const { notificationId } = await req.json();

      const { error } = await supabaseClient
        .from("artist_notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) {
        throw error;
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Notification marked as read",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    console.error("Notification processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
