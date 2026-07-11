import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, serviceKey);

    // Last 50 error/warn entries
    const { data: recentErrors, error: errErr } = await db
      .from("dccs_system_logs")
      .select("id, event_type, message, severity, created_at, metadata")
      .in("severity", ["error", "warn"])
      .order("created_at", { ascending: false })
      .limit(50);

    if (errErr) throw errErr;

    // 30-day aggregate counts
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: counts, error: cntErr } = await db
      .from("dccs_system_logs")
      .select("event_type")
      .gte("created_at", since);

    if (cntErr) throw cntErr;

    const tally = (counts ?? []).reduce<Record<string, number>>((acc, row) => {
      acc[row.event_type] = (acc[row.event_type] ?? 0) + 1;
      return acc;
    }, {});

    const totalUploads   = (tally["upload_success"] ?? 0) + (tally["upload_fail"] ?? 0);
    const uploadRate     = totalUploads === 0 ? null : Math.round(((tally["upload_success"] ?? 0) / totalUploads) * 100);

    const totalCerts     = (tally["cert_success"] ?? 0) + (tally["cert_fail"] ?? 0);
    const certRate       = totalCerts === 0 ? null : Math.round(((tally["cert_success"] ?? 0) / totalCerts) * 100);

    const errorCount     = (recentErrors ?? []).filter(e => e.severity === "error").length;
    const systemStatus   = errorCount > 10 ? "DEGRADED" : "OK";

    const payload = {
      system_status:          systemStatus,
      checked_at:             new Date().toISOString(),
      window_days:            30,
      upload_success_rate:    uploadRate === null ? null : `${uploadRate}%`,
      certificate_success_rate: certRate === null ? null : `${certRate}%`,
      event_counts_30d:       tally,
      recent_errors_count:    recentErrors?.length ?? 0,
      recent_errors:          recentErrors ?? [],
    };

    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ system_status: "ERROR", error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
