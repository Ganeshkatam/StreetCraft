import type { Metadata } from 'next';
import { getAccountNotifications } from '../../../../lib/server/account/getAccountNotifications';
import { NotificationsPanelView } from './NotificationsPanelView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '03 Notifications — Account Settings',
  description: 'Manage email alerts, WhatsApp opportunity triggers, and weekly digest preferences.',
};

export default async function AccountNotificationsPage() {
  const preferences = await getAccountNotifications();

  return <NotificationsPanelView preferences={preferences} />;
}
