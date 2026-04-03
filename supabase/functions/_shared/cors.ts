/**
 * CORS Headers Configuration
 * Centralized CORS management for all Edge Functions
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

/**
 * Handle CORS preflight requests
 * @returns Response with CORS headers
 */
export function handleCorsPreflightRequest(): Response {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

/**
 * Create JSON response with CORS headers
 * @param data - Response data
 * @param status - HTTP status code
 * @returns Response with JSON body and CORS headers
 */
export function createCorsResponse(data: unknown, status: number = 200): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  );
}
