import { redirect } from 'next/navigation';
import { createClient } from '../../supabase/server';

export interface VerifiedUserClaims {
  userId: string;
  email?: string;
  role?: string;
  appMetadata: Record<string, unknown>;
  userMetadata: Record<string, unknown>;
}

/**
 * Validates session claims, extracts verified userId, and protects server components.
 * 
 * We use `supabase.auth.getUser()` to ensure a fully validated session by the Supabase Auth Server.
 */
export async function requireAuthenticatedClaims(returnPath?: string): Promise<VerifiedUserClaims> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    let loginUrl = '/login';
    if (returnPath && returnPath.startsWith('/') && !returnPath.startsWith('//')) {
      loginUrl += `?redirect=${encodeURIComponent(returnPath)}`;
    }
    redirect(loginUrl);
  }

  return {
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    appMetadata: (data.user.app_metadata || {}) as Record<string, unknown>,
    userMetadata: (data.user.user_metadata || {}) as Record<string, unknown>,
  };
}
