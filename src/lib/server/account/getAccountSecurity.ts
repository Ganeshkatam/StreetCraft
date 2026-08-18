import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';

export interface AccountSecurityViewModel {
  userId: string;
  email: string;
  authProvider: string;
  createdAt: string;
  lastSignInAt: string | null;
}

export async function getAccountSecurity(): Promise<AccountSecurityViewModel> {
  const claims = await requireAuthenticatedClaims('/user/account/security');
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  const appMeta = (user?.app_metadata || {}) as Record<string, any>;
  const provider = appMeta.provider || (Array.isArray(appMeta.providers) ? appMeta.providers[0] : 'email');

  return {
    userId: claims.userId,
    email: claims.email || user?.email || '',
    authProvider: provider,
    createdAt: user?.created_at || new Date().toISOString(),
    lastSignInAt: user?.last_sign_in_at || null,
  };
}
