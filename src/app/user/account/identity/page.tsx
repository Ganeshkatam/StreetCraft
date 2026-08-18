import type { Metadata } from 'next';
import { getAccountProfile } from '../../../../lib/server/account/getAccountProfile';
import { IdentityPanelView } from './IdentityPanelView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: ' Identity — Account Settings',
  description: 'Manage personal profile name, contact number, and verified identity.',
};

export default async function AccountIdentityPage() {
  const profile = await getAccountProfile();

  return <IdentityPanelView profile={profile} />;
}
