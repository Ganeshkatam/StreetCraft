import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PlanView } from './PlanView';
import { getStorePlan } from '../../../../../lib/server/plan/getStorePlan';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Plan & Usage — StreetCraft Commercial Console',
  description: 'Store-level quota allowances, subscription status, and billing ledger.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function StorePlanPage({ params }: PageProps) {
  const { businessId } = await params;
  const planData = await getStorePlan(businessId);

  if (!planData) {
    notFound();
  }

  return <PlanView planData={planData} />;
}
