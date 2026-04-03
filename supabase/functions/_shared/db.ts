/**
 * Database Client Utilities
 * Centralized Supabase client creation and management
 */

import { createClient as createSupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

/**
 * Create authenticated Supabase client from request
 * Uses the Authorization header from the request to authenticate
 * @param req - HTTP Request object
 * @returns Authenticated Supabase client
 */
export function createClient(req: Request): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  const authHeader = req.headers.get('Authorization');

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Create service role Supabase client
 * Bypasses RLS - use with caution
 * @returns Service role Supabase client
 */
export function createServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Execute database transaction
 * @param client - Supabase client
 * @param operations - Array of database operations
 * @returns Transaction result
 */
export async function executeTransaction<T>(
  client: SupabaseClient,
  operations: ((client: SupabaseClient) => Promise<T>)[]
): Promise<T[]> {
  const results: T[] = [];

  for (const operation of operations) {
    const result = await operation(client);
    results.push(result);
  }

  return results;
}
