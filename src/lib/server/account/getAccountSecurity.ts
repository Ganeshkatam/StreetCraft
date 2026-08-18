import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';
import { SecurityViewModel } from '../../domain/account/accountTypes';

export async function getAccountSecurity(): Promise<SecurityViewModel> {
  const claims = await requireAuthenticatedClaims('/user/account/security');
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;

  const appMeta = (user?.app_metadata || {}) as Record<string, unknown>;
  const provider =
    typeof appMeta.provider === 'string'
      ? appMeta.provider
      : Array.isArray(appMeta.providers) && typeof appMeta.providers[0] === 'string'
      ? appMeta.providers[0]
      : 'email';

  return {
    email: claims.email || user?.email || '',
    provider,
    lastSignInAt: user?.last_sign_in_at || null,
    createdAt: user?.created_at || new Date().toISOString(),
  };
}
