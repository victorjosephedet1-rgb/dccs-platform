import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
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
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { dccsId, successUrl, cancelUrl } = await req.json();

    if (!dccsId) {
      return new Response(
        JSON.stringify({ error: "Missing dccsId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: certificate } = await supabaseAdmin
      .from("dccs_certificates")
      .select("id, creator_id, project_title, download_unlocked")
      .eq("id", dccsId)
      .maybeSingle();

    if (!certificate) {
      return new Response(
        JSON.stringify({ error: "DCCS certificate not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (certificate.creator_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Not authorized. Only owner can pay for re-download." }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (certificate.download_unlocked) {
      return new Response(
        JSON.stringify({ error: "Download already unlocked" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const redownloadFee = 5.00;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `DCCS Re-download: ${certificate.project_title || "Untitled"}`,
              description: "Unlock download access for your DCCS registered content",
            },
            unit_amount: Math.round(redownloadFee * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${Deno.env.get("SUPABASE_URL")}/dccs/download-success`,
      cancel_url: cancelUrl || `${Deno.env.get("SUPABASE_URL")}/dccs/download-cancel`,
      metadata: {
        productType: "dccs_redownload",
        userId: user.id,
        dccsId: dccsId,
      },
    });

    await supabaseAdmin
      .from("payment_records")
      .insert({
        user_id: user.id,
        dccs_id: dccsId,
        amount: redownloadFee,
        currency: "gbp",
        status: "pending",
        transaction_reference: session.id,
      });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Payment checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
