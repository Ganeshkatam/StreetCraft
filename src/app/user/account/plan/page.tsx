import type { Metadata } from 'next';
import { getAccountPlan } from '../../../../lib/server/account/getAccountPlan';
import { PlanPanelView } from './PlanPanelView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '05 Plan & Usage — Account Settings',
  description: 'Manage subscription tier, storefront allowances, and monthly campaign quotas.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AccountPlanPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const planData = await getAccountPlan(candidateBizId);

  return <PlanPanelView planData={planData} />;
}
