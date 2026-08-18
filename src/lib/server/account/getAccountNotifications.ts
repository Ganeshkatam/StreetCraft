import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';

export interface AccountNotificationPreferences {
  email: boolean;
  whatsapp: boolean;
  weekly_digest: boolean;
}

export async function getAccountNotifications(): Promise<AccountNotificationPreferences> {
  const claims = await requireAuthenticatedClaims('/user/account/notifications');
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('id', claims.userId)
    .maybeSingle();

  const prefs = profile?.notification_preferences as any;

  return {
    email: prefs?.email ?? true,
    whatsapp: prefs?.whatsapp ?? false,
    weekly_digest: prefs?.weekly_digest ?? true,
  };
}
