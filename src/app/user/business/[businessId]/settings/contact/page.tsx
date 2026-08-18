import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBusinessProfile } from '../../../../../../lib/server/business/getBusinessProfile';
import { StoreContactPanel } from '../panels/StoreContactPanel';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact & WhatsApp Settings — StreetCraft',
  description: 'Manage store phone number, WhatsApp contact, and inquiry details.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function StoreContactSettingsPage({ params }: PageProps) {
  const { businessId } = await params;
  const profile = await getBusinessProfile(businessId);

  if (!profile) {
    notFound();
  }

  return <StoreContactPanel profile={profile} />;
}
