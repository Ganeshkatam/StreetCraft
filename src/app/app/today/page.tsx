import type { Metadata } from 'next';
import { TodayView } from './TodayView';
import { getWorkspaceTodayData } from '../../../lib/server/workspace/getWorkspaceTodayData';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Today Dashboard — StreetCraft Workspace',
  description: 'Daily briefing, store opportunity radar, and active campaigns for your store.',
};

export default async function TodayPage({
  searchParams,
}: {
  searchParams?: Promise<{ biz?: string }>;
}) {
  const params = await searchParams;
  const candidateBizId = params?.biz;

  const data = await getWorkspaceTodayData(candidateBizId);

  // Intentional empty state handled cleanly by the view if no businesses exist
  // We can also pass null to the view to represent "no businesses setup"

  return <TodayView initialData={data} />;
}
