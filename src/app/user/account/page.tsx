import type { Metadata } from 'next';
import { AccountSettingsView } from './AccountSettingsView';
import { getAccountProfile } from '../../../lib/server/account/getAccountProfile';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Account Settings — StreetCraft Workspace',
  description: 'Manage operator account details, notification preferences, password updates, and session sign-out.',
};

export default async function AccountSettingsPage() {
  const accountData = await getAccountProfile();
  return <AccountSettingsView accountData={accountData} />;
}
