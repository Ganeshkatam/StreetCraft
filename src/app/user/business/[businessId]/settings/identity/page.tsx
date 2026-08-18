import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBusinessProfile } from '../../../../../../lib/server/business/getBusinessProfile';
import { StoreIdentityPanel } from '../panels/StoreIdentityPanel';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Store Identity Settings — StreetCraft',
  description: 'Manage store name, category, location, and specialties.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function StoreIdentitySettingsPage({ params }: PageProps) {
  const { businessId } = await params;
  const profile = await getBusinessProfile(businessId);

  if (!profile) {
    notFound();
  }

  return <StoreIdentityPanel profile={profile} />;
}
