import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "npm:@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature",
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
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-11-20.acacia",
    });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    console.log("Webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.metadata?.productType === "dccs_registration") {
          await handleDCCSRegistration(supabaseClient, session);
        } else if (session.metadata?.productType === "dccs_redownload") {
          await handleDCCSRedownload(supabaseClient, session);
        } else if (session.metadata?.productType === "track") {
          await handleTrackPurchase(supabaseClient, stripe, session);
        } else if (session.metadata?.productType === "pack") {
          await handlePackPurchase(supabaseClient, session);
        }
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdate(supabaseClient, account);
        break;
      }

      case "transfer.created": {
        const transfer = event.data.object as Stripe.Transfer;
        console.log("Transfer created:", transfer.id, "Amount:", transfer.amount);
        break;
      }

      case "transfer.paid": {
        const transfer = event.data.object as Stripe.Transfer;
        await handleTransferPaid(supabaseClient, transfer);
        break;
      }

      case "transfer.failed": {
        const transfer = event.data.object as Stripe.Transfer;
        await handleTransferFailed(supabaseClient, transfer);
        break;
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handleTrackPurchase(
  supabase: any,
  stripe: Stripe,
  session: Stripe.Checkout.Session
) {
  const { userId, trackId, artistId } = session.metadata!;
  
  const { data: track } = await supabase
    .from("audio_snippets")
    .select("*")
    .eq("id", trackId)
    .maybeSingle();

  if (!track) {
    console.error("Track not found:", trackId);
    return;
  }

  const { data: license, error: licenseError } = await supabase
    .from("track_licenses")
    .insert({
      track_id: trackId,
      buyer_id: userId,
      artist_id: artistId,
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      amount_paid: (session.amount_total || 0) / 100,
      currency: session.currency,
      license_type: session.metadata?.licenseType || "Content Creator License",
      license_data: {
        platforms: ["youtube", "tiktok", "instagram", "twitch"],
        duration_months: 12,
        territory: "worldwide",
      },
      download_url: track.file_url,
      payment_status: "completed",
    })
    .select()
    .single();

  if (licenseError) {
    console.error("Error creating license:", licenseError);
    return;
  }

  console.log("License created:", license.id);

  const { data: artist } = await supabase
    .from("profiles")
    .select("stripe_account_id, instant_payout_enabled")
    .eq("id", artistId)
    .maybeSingle();

  if (artist?.stripe_account_id && artist?.instant_payout_enabled) {
    const totalAmount = (session.amount_total || 0) / 100;
    const artistPayout = totalAmount * 0.80;

    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(artistPayout * 100),
        currency: session.currency || "gbp",
        destination: artist.stripe_account_id,
        description: `Instant payout for track: ${track.title}`,
        metadata: {
          license_id: license.id,
          track_id: trackId,
          artist_id: artistId,
        },
      });

      await supabase
        .from("instant_payouts")
        .update({
          stripe_transfer_id: transfer.id,
          payout_status: "processing",
        })
        .eq("license_id", license.id);

      console.log("Instant transfer created:", transfer.id, "Amount:", artistPayout);
    } catch (transferError) {
      console.error("Transfer error:", transferError);
      
      await supabase
        .from("instant_payouts")
        .update({
          payout_status: "failed",
          error_message: transferError.message,
        })
        .eq("license_id", license.id);
    }
  } else {
    console.log("Artist Stripe Connect not enabled, payout will be manual");
  }
}

async function handleDCCSRegistration(
  supabase: any,
  session: Stripe.Checkout.Session
) {
  const { userId, fileIds } = session.metadata!;

  try {
    const uploadIds = JSON.parse(fileIds);

    for (const uploadId of uploadIds) {
      const { data: upload } = await supabase
        .from("uploads")
        .select("*")
        .eq("id", uploadId)
        .maybeSingle();

      if (!upload) {
        console.error("Upload not found:", uploadId);
        continue;
      }

      const clearanceCode = `V3B-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      const { error: certError } = await supabase
        .from("dccs_certificates")
        .insert({
          upload_id: uploadId,
          user_id: userId,
          certificate_type: "paid_registration",
          clearance_code: clearanceCode,
          file_hash: upload.file_hash || "",
          metadata: {
            registration_fee_paid: (session.amount_total || 0) / 100 / uploadIds.length,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent,
          },
          verification_status: "verified",
          is_public: true,
        });

      if (certError) {
        console.error("Error creating DCCS certificate:", certError);
      } else {
        console.log("DCCS certificate created for upload:", uploadId, "Code:", clearanceCode);
      }
    }
  } catch (error) {
    console.error("Error processing DCCS registration:", error);
  }
}

async function handleDCCSRedownload(
  supabase: any,
  session: Stripe.Checkout.Session
) {
  const { userId, dccsId } = session.metadata!;

  try {
    const { error: paymentError } = await supabase
      .from("payment_records")
      .insert({
        user_id: userId,
        dccs_id: dccsId,
        amount: (session.amount_total || 0) / 100,
        currency: session.currency || "gbp",
        status: "completed",
        transaction_reference: session.payment_intent || session.id,
      });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      return;
    }

    console.log("DCCS re-download payment completed for:", dccsId);
  } catch (error) {
    console.error("Error processing DCCS re-download payment:", error);
  }
}

async function handlePackPurchase(
  supabase: any,
  session: Stripe.Checkout.Session
) {
  const { userId, packId } = session.metadata!;

  const { error } = await supabase
    .from("pack_purchases")
    .insert({
      pack_id: packId,
      user_id: userId,
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent,
      amount_paid: (session.amount_total || 0) / 100,
      currency: session.currency,
      payment_status: "completed",
    });

  if (error) {
    console.error("Error creating pack purchase:", error);
  } else {
    console.log("Pack purchase recorded for pack:", packId);
  }
}

async function handleAccountUpdate(
  supabase: any,
  account: Stripe.Account
) {
  const status = account.charges_enabled && account.payouts_enabled
    ? "complete"
    : account.details_submitted
    ? "pending"
    : "incomplete";

  const { error } = await supabase
    .from("profiles")
    .update({
      stripe_connect_status: status,
      instant_payout_enabled: account.charges_enabled && account.payouts_enabled,
    })
    .eq("stripe_account_id", account.id);

  if (error) {
    console.error("Error updating account status:", error);
  } else {
    console.log("Account status updated:", account.id, status);
  }
}

async function handleTransferPaid(
  supabase: any,
  transfer: Stripe.Transfer
) {
  const { license_id } = transfer.metadata || {};

  if (license_id) {
    await supabase
      .from("instant_payouts")
      .update({
        payout_status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("stripe_transfer_id", transfer.id);

    console.log("Payout completed:", transfer.id);
  }
}

async function handleTransferFailed(
  supabase: any,
  transfer: Stripe.Transfer
) {
  await supabase
    .from("instant_payouts")
    .update({
      payout_status: "failed",
      error_message: transfer.failure_message || "Transfer failed",
    })
    .eq("stripe_transfer_id", transfer.id);

  console.log("Payout failed:", transfer.id, transfer.failure_message);
}