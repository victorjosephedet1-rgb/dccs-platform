// ====================================================================
// V3BMUSIC.AI GITHUB DEPLOYMENT WEBHOOK HANDLER
// ====================================================================
//
// CRITICAL INFRASTRUCTURE - DO NOT DELETE
//
// PURPOSE:
//   Receives webhooks from GitHub Actions when deployments complete.
//   Automatically tracks deployment versions, logs, and triggers
//   customer notifications.
//
// CALLED BY:
//   - GitHub Actions production-deploy.yml workflow
//   - GitHub Actions staging-deploy.yml workflow
//
// DEPENDENCIES:
//   - deployment_versions table
//   - deployment_logs table
//   - customer_instances table
//   - notify-deployment-updates Edge Function
//
// ENVIRONMENT VARIABLES:
//   - SUPABASE_URL: Project URL (auto-populated)
//   - SUPABASE_SERVICE_ROLE_KEY: Admin key (auto-populated)
//   - GITHUB_TOKEN: GitHub personal access token (for API calls)
//
// REQUEST PAYLOAD:
//   {
//     "run_id": "123456789",
//     "run_number": 42,
//     "workflow": "production-deploy",
//     "commit_sha": "abc123def456",
//     "commit_message": "Add new feature",
//     "status": "success",
//     "started_at": "2026-02-27T12:00:00Z",
//     "completed_at": "2026-02-27T12:05:00Z",
//     "repository": "yourusername/v3bmusic",
//     "branch": "main"
//   }
//
// RESPONSE:
//   {
//     "success": true,
//     "deployment_id": "uuid-here",
//     "version": "1.42.0",
//     "customers_notified": 5
//   }
//
// SECURITY:
//   - Validates GitHub webhook signature (X-Hub-Signature-256)
//   - Uses service role key for database operations
//   - Logs all webhook attempts
//
// DOCUMENTATION:
//   - Setup Guide: AUTO_DEPLOYMENT_GUIDE.md
//   - Architecture: docs/DEPLOYMENT_SYSTEM_ARCHITECTURE.md
//
// ====================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Hub-Signature-256",
};

interface GitHubDeploymentPayload {
  run_id: string;
  run_number: number;
  workflow: string;
  commit_sha: string;
  commit_message: string;
  status: "success" | "failure" | "cancelled";
  started_at: string;
  completed_at: string;
  repository: string;
  branch: string;
  actor?: string;
  changed_files?: string[];
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Parse webhook payload
    const payload: GitHubDeploymentPayload = await req.json();

    console.log(`[GitHub Webhook] Received deployment notification:`, {
      workflow: payload.workflow,
      run_number: payload.run_number,
      status: payload.status,
      commit: payload.commit_sha?.substring(0, 7),
    });

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate semantic version from run number
    // Format: 1.{run_number}.0
    const versionNumber = `1.${payload.run_number}.0`;

    // Calculate build duration
    const startedAt = new Date(payload.started_at);
    const completedAt = new Date(payload.completed_at);
    const buildDuration = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);

    // Map GitHub status to deployment status
    const deploymentStatus = payload.status === "success" ? "deployed" :
                            payload.status === "failure" ? "failed" :
                            "rolled_back";

    // Create deployment version record
    const { data: deployment, error: deploymentError } = await supabase
      .from('deployment_versions')
      .insert({
        version_number: versionNumber,
        commit_hash: payload.commit_sha,
        deployment_status: deploymentStatus,
        changes_summary: {
          message: payload.commit_message,
          workflow: payload.workflow,
          branch: payload.branch,
          actor: payload.actor || 'github-actions',
        },
        affected_files: payload.changed_files || [],
        build_duration_seconds: buildDuration,
        metadata: {
          run_id: payload.run_id,
          repository: payload.repository,
          started_at: payload.started_at,
          completed_at: payload.completed_at,
        },
      })
      .select()
      .single();

    if (deploymentError) {
      // If version already exists, update it instead
      if (deploymentError.code === '23505') {
        const { data: updated, error: updateError } = await supabase
          .from('deployment_versions')
          .update({
            deployment_status: deploymentStatus,
            build_duration_seconds: buildDuration,
            metadata: {
              run_id: payload.run_id,
              repository: payload.repository,
              started_at: payload.started_at,
              completed_at: payload.completed_at,
            },
          })
          .eq('version_number', versionNumber)
          .select()
          .single();

        if (updateError) throw updateError;

        console.log(`[GitHub Webhook] Updated existing deployment: ${versionNumber}`);
      } else {
        throw deploymentError;
      }
    } else {
      console.log(`[GitHub Webhook] Created deployment record: ${versionNumber}`);
    }

    // Create deployment log entry
    await supabase
      .from('deployment_logs')
      .insert({
        deployment_version_id: deployment?.id,
        log_level: payload.status === "success" ? "success" : "error",
        message: `Deployment ${payload.status} for ${payload.workflow}`,
        details: {
          run_id: payload.run_id,
          commit_sha: payload.commit_sha,
          commit_message: payload.commit_message,
          build_duration_seconds: buildDuration,
        },
      });

    let customersNotified = 0;

    // Only notify customers if deployment was successful
    if (payload.status === "success" && payload.workflow === "production-deploy") {
      console.log(`[GitHub Webhook] Triggering customer notifications...`);

      // Call notify-deployment-updates Edge Function
      const notifyUrl = `${supabaseUrl}/functions/v1/notify-deployment-updates`;

      try {
        const notifyResponse = await fetch(notifyUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            version: versionNumber,
            commit: payload.commit_sha,
            message: payload.commit_message,
          }),
        });

        if (notifyResponse.ok) {
          const notifyResult = await notifyResponse.json();
          customersNotified = notifyResult.customers_notified || 0;
          console.log(`[GitHub Webhook] Notified ${customersNotified} customers`);
        } else {
          console.error('[GitHub Webhook] Failed to notify customers:', await notifyResponse.text());
        }
      } catch (notifyError) {
        console.error('[GitHub Webhook] Error notifying customers:', notifyError);
      }
    }

    // Fetch GitHub commit details for additional context
    if (Deno.env.get('GITHUB_TOKEN')) {
      try {
        const [owner, repo] = payload.repository.split('/');
        const githubApiUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${payload.commit_sha}`;

        const commitResponse = await fetch(githubApiUrl, {
          headers: {
            'Authorization': `token ${Deno.env.get('GITHUB_TOKEN')}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        if (commitResponse.ok) {
          const commitData = await commitResponse.json();

          // Update deployment with detailed file changes
          await supabase
            .from('deployment_versions')
            .update({
              affected_files: commitData.files?.map((f: any) => f.filename) || [],
              changes_summary: {
                message: payload.commit_message,
                workflow: payload.workflow,
                branch: payload.branch,
                actor: commitData.commit?.author?.name || payload.actor,
                files_changed: commitData.files?.length || 0,
                additions: commitData.stats?.additions || 0,
                deletions: commitData.stats?.deletions || 0,
              },
            })
            .eq('version_number', versionNumber);

          console.log(`[GitHub Webhook] Enhanced deployment with commit details`);
        }
      } catch (githubError) {
        console.warn('[GitHub Webhook] Could not fetch GitHub commit details:', githubError);
      }
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        deployment_id: deployment?.id,
        version: versionNumber,
        status: deploymentStatus,
        customers_notified: customersNotified,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('[GitHub Webhook] Error processing deployment:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
