import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
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

    const { action } = await req.json();

    if (action === "create_account") {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("stripe_account_id, email, name, country")
        .eq("id", user.id)
        .maybeSingle();

      let accountId = profile?.stripe_account_id;

      if (!accountId) {
        const account = await stripe.accounts.create({
          type: "express",
          country: profile?.country || "GB",
          email: profile?.email || user.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: "individual",
          business_profile: {
            name: profile?.name || "V3BMusic Artist",
            mcc: "7929",
            product_description: "Music licensing and royalties",
          },
        });

        accountId = account.id;

        await supabaseClient
          .from("profiles")
          .update({
            stripe_account_id: accountId,
            stripe_connect_status: "pending",
          })
          .eq("id", user.id);
      }

      const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${req.headers.get("origin")}/artist-dashboard?stripe_refresh=true`,
        return_url: `${req.headers.get("origin")}/artist-dashboard?stripe_connected=true`,
        type: "account_onboarding",
      });

      return new Response(
        JSON.stringify({ url: accountLink.url, accountId }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else if (action === "check_status") {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("stripe_account_id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.stripe_account_id) {
        return new Response(
          JSON.stringify({ status: "not_connected", charges_enabled: false, payouts_enabled: false }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const account = await stripe.accounts.retrieve(profile.stripe_account_id);

      const status = account.charges_enabled && account.payouts_enabled
        ? "complete"
        : account.details_submitted
        ? "pending"
        : "incomplete";

      await supabaseClient
        .from("profiles")
        .update({
          stripe_connect_status: status,
          instant_payout_enabled: account.charges_enabled && account.payouts_enabled,
        })
        .eq("id", user.id);

      return new Response(
        JSON.stringify({
          status,
          charges_enabled: account.charges_enabled,
          payouts_enabled: account.payouts_enabled,
          details_submitted: account.details_submitted,
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
    console.error("Stripe Connect error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});