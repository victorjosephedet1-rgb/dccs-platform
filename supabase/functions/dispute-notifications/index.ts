import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DisputeNotificationPayload {
  type: 'dispute_filed' | 'status_changed' | 'dispute_resolved' | 'evidence_submitted' | 'defendant_responded';
  dispute_id: string;
  dispute_title: string;
  dispute_type: string;
  plaintiff_email: string;
  plaintiff_name: string;
  defendant_email: string;
  defendant_name: string;
  status?: string;
  old_status?: string;
  new_status?: string;
  resolution_type?: string;
  resolution_summary?: string;
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'DCCS Platform <notifications@dccsverify.com>',
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

function getDisputeFiledEmail(payload: DisputeNotificationPayload): { subject: string; html: string } {
  return {
    subject: `⚠️ New Dispute Filed: ${payload.dispute_title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Dispute Notification</h1>
          </div>
          <div class="content">
            <p>Dear ${payload.defendant_name},</p>

            <div class="alert">
              <strong>A dispute has been filed against you on DCCS Platform</strong>
            </div>

            <h3>Dispute Details:</h3>
            <ul>
              <li><strong>Title:</strong> ${payload.dispute_title}</li>
              <li><strong>Type:</strong> ${payload.dispute_type.replace(/_/g, ' ').toUpperCase()}</li>
              <li><strong>Filed by:</strong> ${payload.plaintiff_name}</li>
              <li><strong>Dispute ID:</strong> ${payload.dispute_id}</li>
            </ul>

            <p>You have been named as a defendant in this dispute. We encourage you to:</p>
            <ol>
              <li>Review the dispute details carefully</li>
              <li>Prepare your response and evidence</li>
              <li>Submit your statement within 7 days</li>
            </ol>

            <a href="https://dccsverify.com/disputes/${payload.dispute_id}" class="button">View Dispute Details</a>

            <p><strong>Important:</strong> Failure to respond within 7 days may result in a default judgment.</p>

            <div class="footer">
              <p>This is an automated notification from DCCS Platform</p>
              <p>© ${new Date().getFullYear()} DCCS Platform - All Rights Reserved</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

function getStatusChangedEmail(payload: DisputeNotificationPayload, recipient: 'plaintiff' | 'defendant'): { subject: string; html: string } {
  const recipientName = recipient === 'plaintiff' ? payload.plaintiff_name : payload.defendant_name;

  return {
    subject: `📊 Dispute Status Update: ${payload.dispute_title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { display: inline-block; padding: 8px 15px; border-radius: 20px; font-weight: bold; margin: 10px 5px; }
          .status-old { background: #f0f0f0; color: #666; }
          .status-new { background: #4CAF50; color: white; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Status Update</h1>
          </div>
          <div class="content">
            <p>Dear ${recipientName},</p>

            <p>The status of your dispute has been updated:</p>

            <h3>Dispute: ${payload.dispute_title}</h3>
            <p>Dispute ID: ${payload.dispute_id}</p>

            <div style="text-align: center; margin: 30px 0;">
              <span class="status-badge status-old">${payload.old_status?.toUpperCase()}</span>
              <span style="font-size: 24px;">→</span>
              <span class="status-badge status-new">${payload.new_status?.toUpperCase()}</span>
            </div>

            ${payload.new_status === 'investigating' ? '<p>An administrator has been assigned and is reviewing the case.</p>' : ''}
            ${payload.new_status === 'evidence_review' ? '<p>We are currently reviewing all submitted evidence.</p>' : ''}
            ${payload.new_status === 'mediation' ? '<p>The dispute has entered mediation. We will work to find a fair resolution.</p>' : ''}

            <a href="https://dccsverify.com/disputes/${payload.dispute_id}" class="button">View Dispute</a>

            <p>You will receive further updates as the dispute progresses.</p>

            <div class="footer">
              <p>This is an automated notification from DCCS Platform</p>
              <p>© ${new Date().getFullYear()} DCCS Platform - All Rights Reserved</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

function getDisputeResolvedEmail(payload: DisputeNotificationPayload, recipient: 'plaintiff' | 'defendant'): { subject: string; html: string } {
  const recipientName = recipient === 'plaintiff' ? payload.plaintiff_name : payload.defendant_name;
  const isWinner =
    (recipient === 'plaintiff' && payload.resolution_type === 'plaintiff_favor') ||
    (recipient === 'defendant' && payload.resolution_type === 'defendant_favor') ||
    payload.resolution_type === 'settlement';

  return {
    subject: `✅ Dispute Resolved: ${payload.dispute_title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .resolution { background: ${isWinner ? '#d4edda' : '#fff3cd'}; border-left: 4px solid ${isWinner ? '#28a745' : '#ffc107'}; padding: 20px; margin: 20px 0; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Dispute Resolved</h1>
          </div>
          <div class="content">
            <p>Dear ${recipientName},</p>

            <p>The dispute <strong>"${payload.dispute_title}"</strong> has been resolved.</p>

            <div class="resolution">
              <h3>Resolution: ${payload.resolution_type?.replace(/_/g, ' ').toUpperCase()}</h3>
              ${payload.resolution_summary ? `<p>${payload.resolution_summary}</p>` : ''}
            </div>

            <p><strong>Dispute ID:</strong> ${payload.dispute_id}</p>

            <a href="https://dccsverify.com/disputes/${payload.dispute_id}" class="button">View Full Resolution</a>

            <p>If you have any questions about this resolution, please contact our support team.</p>

            <p>Thank you for your patience throughout this process.</p>

            <div class="footer">
              <p>This is an automated notification from DCCS Platform</p>
              <p>© ${new Date().getFullYear()} DCCS Platform - All Rights Reserved</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const payload: DisputeNotificationPayload = await req.json();

    const results = [];

    switch (payload.type) {
      case 'dispute_filed': {
        const { subject, html } = getDisputeFiledEmail(payload);
        const result = await sendEmail(payload.defendant_email, subject, html);
        results.push({ recipient: 'defendant', ...result });
        break;
      }

      case 'status_changed': {
        const plaintiffEmail = getStatusChangedEmail(payload, 'plaintiff');
        const defendantEmail = getStatusChangedEmail(payload, 'defendant');

        const [plaintiffResult, defendantResult] = await Promise.all([
          sendEmail(payload.plaintiff_email, plaintiffEmail.subject, plaintiffEmail.html),
          sendEmail(payload.defendant_email, defendantEmail.subject, defendantEmail.html),
        ]);

        results.push(
          { recipient: 'plaintiff', ...plaintiffResult },
          { recipient: 'defendant', ...defendantResult }
        );
        break;
      }

      case 'dispute_resolved': {
        const plaintiffEmail = getDisputeResolvedEmail(payload, 'plaintiff');
        const defendantEmail = getDisputeResolvedEmail(payload, 'defendant');

        const [plaintiffResult, defendantResult] = await Promise.all([
          sendEmail(payload.plaintiff_email, plaintiffEmail.subject, plaintiffEmail.html),
          sendEmail(payload.defendant_email, defendantEmail.subject, defendantEmail.html),
        ]);

        results.push(
          { recipient: 'plaintiff', ...plaintiffResult },
          { recipient: 'defendant', ...defendantResult }
        );
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown notification type' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error processing dispute notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
