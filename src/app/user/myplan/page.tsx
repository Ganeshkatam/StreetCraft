import type { Metadata } from 'next';
import { MyPlanView } from './MyPlanView';
import { getMyPlanData } from '../../../lib/server/myplan/getMyPlanData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Plan — StreetCraft Workspace',
  description: 'Manage subscription tier, monthly campaign allowances, and active store limits.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MyPlanPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const planData = await getMyPlanData(candidateBizId);

  return <MyPlanView billingData={planData} />;
}
