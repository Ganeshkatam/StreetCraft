import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TodayView } from './TodayView';
import { getTodayWorkspace } from '../../../../../lib/server/today/getTodayWorkspace';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Today Dashboard — StreetCraft Workspace',
  description: 'Daily briefing, store opportunity radar, and active campaigns for your store.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function TodayPage({ params }: PageProps) {
  const { businessId } = await params;
  const data = await getTodayWorkspace(businessId);

  if (!data) {
    notFound();
  }

  return <TodayView data={data} />;
}
