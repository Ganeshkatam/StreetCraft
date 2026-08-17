import type { Metadata } from 'next';
import { AccountSettingsView } from './AccountSettingsView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Account Settings — StreetCraft Workspace',
  description: 'Manage operator account details, notification preferences, password updates, and session sign-out.',
};

export default function AccountSettingsPage() {
  return <AccountSettingsView />;
}
