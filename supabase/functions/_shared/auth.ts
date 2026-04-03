/**
 * Authentication & Authorization Utilities
 * Centralized auth validation for Edge Functions
 */

import { createClient } from './db.ts';
import { AuthenticationError, AuthorizationError } from './errors.ts';

export interface AuthUser {
  id: string;
  email?: string;
  role?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Validate and extract user from request
 * @param req - HTTP Request
 * @returns Authenticated user
 * @throws AuthenticationError if authentication fails
 */
export async function validateAuth(req: Request): Promise<AuthUser> {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader) {
    throw new AuthenticationError('Missing Authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    throw new AuthenticationError('Invalid Authorization header format');
  }

  const supabase = createClient(req);

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new AuthenticationError('Invalid or expired token');
  }

  return {
    id: user.id,
    email: user.email,
    role: user.user_metadata?.role,
    metadata: user.user_metadata,
  };
}

/**
 * Validate user has required role
 * @param user - Authenticated user
 * @param allowedRoles - Array of allowed roles
 * @throws AuthorizationError if user doesn't have required role
 */
export function requireRole(user: AuthUser, allowedRoles: string[]): void {
  if (!user.role || !allowedRoles.includes(user.role)) {
    throw new AuthorizationError(
      `Access denied. Required roles: ${allowedRoles.join(', ')}`
    );
  }
}

/**
 * Validate user owns the resource
 * @param user - Authenticated user
 * @param resourceUserId - User ID of resource owner
 * @throws AuthorizationError if user doesn't own the resource
 */
export function requireOwnership(user: AuthUser, resourceUserId: string): void {
  if (user.id !== resourceUserId) {
    throw new AuthorizationError('You do not have permission to access this resource');
  }
}

/**
 * Check if user is admin
 * @param user - Authenticated user
 * @returns True if user is admin
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin' || user.role === 'super_admin';
}

/**
 * Validate optional authentication (allows anonymous access)
 * @param req - HTTP Request
 * @returns User if authenticated, null otherwise
 */
export async function validateOptionalAuth(req: Request): Promise<AuthUser | null> {
  try {
    return await validateAuth(req);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return null;
    }
    throw error;
  }
}
