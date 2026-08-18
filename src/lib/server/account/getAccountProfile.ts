import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';
import { IdentityViewModel } from '../../domain/account/accountTypes';

export async function getAccountProfile(): Promise<IdentityViewModel> {
  const claims = await requireAuthenticatedClaims('/user/account/identity');
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, phone, created_at')
    .eq('id', claims.userId)
    .maybeSingle();

  return {
    userId: claims.userId,
    email: claims.email || '',
    fullName: profile?.full_name || '',
    phone: profile?.phone || null,
    avatarUrl: profile?.avatar_url || null,
    emailVerified: Boolean(claims.email),
    createdAt: profile?.created_at || new Date().toISOString(),
  };
}
