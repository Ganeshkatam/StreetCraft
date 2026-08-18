import type { Metadata } from 'next';
import { BillingSettingsView } from './BillingSettingsView';
import { getBillingData } from '../../../lib/server/billing/getBillingData';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Billing & Usage — StreetCraft Workspace',
  description: 'Manage subscription plan, monthly campaign quota, and workspace billing history.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BillingSettingsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const billingData = await getBillingData(candidateBizId);

  return <BillingSettingsView billingData={billingData} />;
}
