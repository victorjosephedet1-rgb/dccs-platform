// ====================================================================
// V3BMUSIC.AI DEPLOYMENT NOTIFICATION EDGE FUNCTION
// ====================================================================
//
// CRITICAL INFRASTRUCTURE - DO NOT DELETE
//
// PURPOSE:
//   Notifies white-label customer instances when the platform deploys
//   a new version. Enables customers with auto-update enabled to sync
//   their instances with the latest platform features.
//
// CALLED BY:
//   - GitHub Actions production-deploy.yml workflow
//   - Manual trigger via Supabase dashboard (for testing)
//
// DEPENDENCIES:
//   - customer_instances table (contains customer webhook URLs)
//   - deployment_versions table (contains deployment metadata)
//   - update_notifications table (records notification delivery)
//
// ENVIRONMENT VARIABLES (Auto-populated by Supabase):
//   - SUPABASE_URL: Project URL
//   - SUPABASE_SERVICE_ROLE_KEY: Admin API key (bypasses RLS)
//
// REQUEST PAYLOAD:
//   {
//     "version": "123",           // GitHub run number
//     "commit": "abc123def456",   // Git commit SHA
//     "message": "Deploy message" // Commit message
//   }
//
// RESPONSE:
//   {
//     "success": true,
//     "customers_notified": 5,
//     "notifications_sent": 10,
//     "version": "123",
//     "timestamp": "2026-02-27T12:00:00Z"
//   }
//
// WEBHOOK PAYLOAD SENT TO CUSTOMERS:
//   {
//     "event": "deployment.completed",
//     "version": "123",
//     "commit": "abc123def456",
//     "message": "Deploy message",
//     "deployed_at": "2026-02-27T12:00:00Z",
//     "platform": "dccsverify.com",
//     "instance_url": "https://customer.example.com"
//   }
//
// ERROR HANDLING:
//   - Non-blocking: Failures logged but don't prevent deployment
//   - Individual customer webhook failures don't affect others
//   - Database unavailability is caught and logged
//   - All errors return 500 with error details
//
// DOCUMENTATION:
//   - Architecture: docs/DEPLOYMENT_SYSTEM_ARCHITECTURE.md
//   - Runbook: DEPLOYMENT_RUNBOOK.md
//
// MONITORING:
//   - Supabase Dashboard > Edge Functions > Logs
//   - update_notifications table for delivery tracking
//
// TESTING:
//   curl -X POST "https://[project].supabase.co/functions/v1/notify-deployment-updates" \
//     -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
//     -H "Content-Type: application/json" \
//     -d '{"version":"test","commit":"test123","message":"Test deployment"}'
//
// ====================================================================

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// CORS headers required for all Supabase Edge Functions
// Allows the function to be called from any origin
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// TypeScript interface for deployment notification payload
// Received from GitHub Actions workflow
interface DeploymentNotification {
  version: string;   // GitHub run number (incremental)
  commit: string;    // Git commit SHA
  message: string;   // Commit message
}

Deno.serve(async (req: Request) => {
  // CORS preflight request handling
  // Required for browsers to make cross-origin requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Parse incoming deployment notification
    // Expected payload: { version, commit, message }
    const { version, commit, message }: DeploymentNotification = await req.json();

    // Get Supabase credentials from environment
    // These are automatically set by Supabase for all Edge Functions
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // STEP 1: Query customer_instances table
    // Fetch all customers who have auto-update enabled
    // These are white-label customers who want automatic sync
    const customersResponse = await fetch(
      `${supabaseUrl}/rest/v1/customer_instances?auto_update_enabled=eq.true&select=*`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!customersResponse.ok) {
      throw new Error(`Failed to fetch customers: ${customersResponse.statusText}`);
    }

    const customers = await customersResponse.json();

    console.log(`Found ${customers.length} customers to notify`);

    const notifications = [];

    // STEP 2: Notify each customer
    // Send webhook notifications and update sync status
    for (const customer of customers) {
      try {
        // Send webhook if customer has configured a webhook URL
        if (customer.webhook_url) {
          // Construct webhook payload with deployment info
          const webhookPayload = {
            event: 'deployment.completed',
            version,
            commit,
            message,
            deployed_at: new Date().toISOString(),
            platform: 'dccsverify.com',
            instance_url: customer.instance_url,
          };

          // POST webhook to customer's endpoint
          // Customer should verify X-V3B-Signature header for security
          const webhookResponse = await fetch(customer.webhook_url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-V3B-Signature': customer.webhook_secret || '',
              'User-Agent': 'V3BMusic-Deployment-Bot/1.0',
            },
            body: JSON.stringify(webhookPayload),
          });

          // Record webhook delivery status
          notifications.push({
            customer_instance_id: customer.id,
            notification_type: 'webhook',
            delivery_status: webhookResponse.ok ? 'delivered' : 'failed',
            response_data: {
              status: webhookResponse.status,
              statusText: webhookResponse.statusText,
            },
          });
        }

        // Send email notification if customer wants email alerts
        if (customer.customer_email && customer.notification_preferences?.email) {
          // TODO: Integrate with email service (SendGrid, Resend, etc.)
          // For now, we log it for manual follow-up
          console.log(`Email notification queued for ${customer.customer_email}`);

          notifications.push({
            customer_instance_id: customer.id,
            notification_type: 'email',
            delivery_status: 'pending',
            response_data: {
              email: customer.customer_email,
              queued_at: new Date().toISOString(),
            },
          });
        }

        // Update customer's sync status
        // Marks when they were last notified of an update
        await fetch(
          `${supabaseUrl}/rest/v1/customer_instances?id=eq.${customer.id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              sync_status: 'synced',
              last_synced_at: new Date().toISOString(),
            }),
          }
        );

      } catch (error) {
        // Individual customer failures don't stop the entire process
        // Log error and continue with other customers
        console.error(`Failed to notify customer ${customer.id}:`, error);
        notifications.push({
          customer_instance_id: customer.id,
          notification_type: 'webhook',
          delivery_status: 'failed',
          response_data: {
            error: error.message,
          },
        });
      }
    }

    // STEP 3: Get deployment version ID
    // Links notifications to the deployment record
    const deploymentResponse = await fetch(
      `${supabaseUrl}/rest/v1/deployment_versions?version_number=eq.${version}&select=id`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    let deploymentVersionId = null;
    if (deploymentResponse.ok) {
      const deployments = await deploymentResponse.json();
      if (deployments.length > 0) {
        deploymentVersionId = deployments[0].id;
      }
    }

    // STEP 4: Record all notifications in database
    // Creates audit trail in update_notifications table
    // Links each notification to the deployment version
    if (deploymentVersionId && notifications.length > 0) {
      await fetch(
        `${supabaseUrl}/rest/v1/update_notifications`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(
            notifications.map(n => ({
              ...n,
              deployment_version_id: deploymentVersionId,
            }))
          ),
        }
      );
    }

    // STEP 5: Return success response
    // Provides summary of notification delivery
    return new Response(
      JSON.stringify({
        success: true,
        customers_notified: customers.length,
        notifications_sent: notifications.length,
        version,
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
    // Error handling: Log and return error response
    // This function is non-blocking in the deployment workflow
    // Errors here won't prevent deployment from completing
    console.error('Error in notify-deployment-updates:', error);

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
