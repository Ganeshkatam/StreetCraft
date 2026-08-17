import { redirect } from 'next/navigation';
import { createClient } from './server';
import type { User } from '@supabase/supabase-js';

export interface VerifiedUserClaims {
  userId: string;
  email?: string;
  role?: string;
  appMetadata: Record<string, unknown>;
  userMetadata: Record<string, unknown>;
}

/**
 * Retrieves the verified authenticated user for the current request.
 * Strict: Validates JWT against Supabase Auth server (zero unverified local session trust).
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Extracts verified user claims from authenticated user payload.
 */
export async function getUserClaims(): Promise<VerifiedUserClaims | null> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return null;
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    appMetadata: (user.app_metadata || {}) as Record<string, unknown>,
    userMetadata: (user.user_metadata || {}) as Record<string, unknown>,
  };
}

/**
 * Server Component / Action Guard: Requires an authenticated user session.
 * If unauthenticated or expired, redirects to /login with return destination.
 */
export async function requireAuth(returnPath?: string): Promise<User> {
  const user = await getAuthenticatedUser();

  if (!user) {
    let loginUrl = '/login';
    if (returnPath && returnPath.startsWith('/') && !returnPath.startsWith('//')) {
      loginUrl += `?redirect=${encodeURIComponent(returnPath)}`;
    }
    redirect(loginUrl);
  }

  return user;
}

/**
 * Server Component / Action Guard: Requires an anonymous visitor.
 * If already authenticated, redirects to /app/today.
 */
export async function requireAnonymous(targetPath: string = '/app/today'): Promise<void> {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect(targetPath);
  }
}
