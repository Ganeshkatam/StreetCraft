import type { Metadata } from 'next';
import { BusinessView } from './BusinessView';
import { getWorkspaceTodayData } from '../../../lib/server/workspace/getWorkspaceTodayData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Store Profile & Context — StreetCraft Workspace',
  description: 'Manage store identity, neighborhood landmarks, specialties, and operating rhythm.',
};

export default async function BusinessPage({
  searchParams,
}: {
  searchParams?: Promise<{ biz?: string }>;
}) {
  const params = await searchParams;
  const candidateBizId = params?.biz;

  const data = await getWorkspaceTodayData(candidateBizId);

  return <BusinessView initialData={data} />;
}
