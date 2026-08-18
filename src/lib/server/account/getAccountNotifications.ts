import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';
import { NotificationsViewModel } from '../../domain/account/accountTypes';
import { normalizeNotificationPreferences } from '../../domain/account/notificationPreferences';

export async function getAccountNotifications(): Promise<NotificationsViewModel> {
  const claims = await requireAuthenticatedClaims('/user/account/notifications');
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('notification_preferences')
    .eq('id', claims.userId)
    .maybeSingle();

  return normalizeNotificationPreferences(profile?.notification_preferences);
}
