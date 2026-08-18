import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBusinessProfile } from '../../../../../../lib/server/business/getBusinessProfile';
import { StoreOfferPanel } from '../panels/StoreOfferPanel';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Offer & Economics Settings — StreetCraft',
  description: 'Manage default store offers, average ticket size, and customer targets.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function StoreOfferSettingsPage({ params }: PageProps) {
  const { businessId } = await params;
  const profile = await getBusinessProfile(businessId);

  if (!profile) {
    notFound();
  }

  return <StoreOfferPanel profile={profile} />;
}
