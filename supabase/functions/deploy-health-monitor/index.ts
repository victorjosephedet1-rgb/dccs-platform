import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const action = url.searchParams.get("action") ?? (req.method === "POST" ? (await req.json().catch(() => ({}))).action : null);

    // ── GET /deploy-health-monitor?action=status ──────────────────────────────
    // Returns latest deployment runs and any unresolved alerts.
    if (action === "status" || req.method === "GET") {
      const [runsRes, alertsRes] = await Promise.all([
        supabase
          .from("deployment_runs")
          .select("id, commit_sha, branch, status, triggered_by, created_at, health_confirmed_at, error_message")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("pipeline_alerts")
          .select("id, alert_type, severity, message, created_at")
          .eq("resolved", false)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      return new Response(
        JSON.stringify({
          ok: true,
          runs: runsRes.data ?? [],
          unresolved_alerts: alertsRes.data ?? [],
          checked_at: new Date().toISOString(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── POST — record a new deployment run ────────────────────────────────────
    if (action === "record_run") {
      const body = await req.json().catch(() => ({}));
      const { commit_sha, commit_message, branch, triggered_by, netlify_deploy_id, netlify_deploy_url } = body;

      if (!commit_sha) {
        return new Response(
          JSON.stringify({ ok: false, error: "commit_sha required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data, error } = await supabase
        .from("deployment_runs")
        .insert({
          commit_sha,
          commit_message: commit_message ?? null,
          branch: branch ?? "main",
          triggered_by: triggered_by ?? "push",
          netlify_deploy_id: netlify_deploy_id ?? null,
          netlify_deploy_url: netlify_deploy_url ?? null,
          status: "building",
          build_started_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ ok: true, run_id: data.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── POST — update run status ──────────────────────────────────────────────
    if (action === "update_run") {
      const body = await req.json().catch(() => ({}));
      const { run_id, status, error_message, netlify_deploy_id, netlify_deploy_url } = body;

      if (!run_id || !status) {
        return new Response(
          JSON.stringify({ ok: false, error: "run_id and status required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const updatePayload: Record<string, unknown> = { status };
      if (error_message) updatePayload.error_message = error_message;
      if (netlify_deploy_id) updatePayload.netlify_deploy_id = netlify_deploy_id;
      if (netlify_deploy_url) updatePayload.netlify_deploy_url = netlify_deploy_url;

      if (status === "deploying") updatePayload.deploy_started_at = new Date().toISOString();
      if (status === "healthy")   updatePayload.health_confirmed_at = new Date().toISOString();
      if (status === "failed" || status === "healthy") updatePayload.deploy_completed_at = new Date().toISOString();

      const { error } = await supabase
        .from("deployment_runs")
        .update(updatePayload)
        .eq("id", run_id);

      if (error) throw error;

      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── POST — record health check result ─────────────────────────────────────
    if (action === "record_health_check") {
      const body = await req.json().catch(() => ({}));
      const { run_id, check_url, http_status, response_time_ms, passed, attempt_number, error_detail } = body;

      if (!run_id || !check_url) {
        return new Response(
          JSON.stringify({ ok: false, error: "run_id and check_url required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("deployment_health_checks")
        .insert({
          deployment_run_id: run_id,
          check_url,
          http_status: http_status ?? null,
          response_time_ms: response_time_ms ?? null,
          passed: passed ?? false,
          attempt_number: attempt_number ?? 1,
          error_detail: error_detail ?? null,
        });

      if (error) throw error;

      // Increment health_check_count on the run
      await supabase.rpc("increment_health_check_count", { p_run_id: run_id }).maybeSingle();

      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── POST — raise pipeline alert ───────────────────────────────────────────
    if (action === "raise_alert") {
      const body = await req.json().catch(() => ({}));
      const { run_id, alert_type, severity, message, metadata } = body;

      if (!alert_type || !message) {
        return new Response(
          JSON.stringify({ ok: false, error: "alert_type and message required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("pipeline_alerts")
        .insert({
          deployment_run_id: run_id ?? null,
          alert_type,
          severity: severity ?? "warning",
          message,
          metadata: metadata ?? {},
        });

      if (error) throw error;

      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── POST — resolve alerts for a run ───────────────────────────────────────
    if (action === "resolve_alerts") {
      const body = await req.json().catch(() => ({}));
      const { run_id } = body;

      const query = supabase
        .from("pipeline_alerts")
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq("resolved", false);

      if (run_id) query.eq("deployment_run_id", run_id);

      const { error } = await query;
      if (error) throw error;

      return new Response(
        JSON.stringify({ ok: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: false, error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("deploy-health-monitor error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: (err as Error).message ?? "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
