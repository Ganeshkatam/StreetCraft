import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';

export interface AccountIdentityViewModel {
  userId: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string;
  verified: boolean;
}

export async function getAccountProfile(): Promise<AccountIdentityViewModel> {
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
    createdAt: profile?.created_at || new Date().toISOString(),
    verified: Boolean(claims.email),
  };
}
