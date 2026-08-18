import type { Metadata } from 'next';
import { getAccountSecurity } from '../../../../lib/server/account/getAccountSecurity';
import { SecurityPanelView } from './SecurityPanelView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '04 Security — Account Settings',
  description: 'Manage password, login credentials, and active session security.',
};

export default async function AccountSecurityPage() {
  const security = await getAccountSecurity();

  return <SecurityPanelView security={security} />;
}
