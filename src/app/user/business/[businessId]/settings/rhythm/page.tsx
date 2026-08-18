import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBusinessProfile } from '../../../../../../lib/server/business/getBusinessProfile';
import { StoreRhythmPanel } from '../panels/StoreRhythmPanel';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Operating Rhythm Settings — StreetCraft',
  description: 'Manage peak rush and slow afternoon hours for automated campaign triggers.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function StoreRhythmSettingsPage({ params }: PageProps) {
  const { businessId } = await params;
  const profile = await getBusinessProfile(businessId);

  if (!profile) {
    notFound();
  }

  return <StoreRhythmPanel profile={profile} />;
}
