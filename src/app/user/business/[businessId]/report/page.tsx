import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ReportPage } from './ReportPage';
import { getStoreReport } from '../../../../../lib/server/report/getStoreReport';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Marketing Operations Report — StreetCraft',
  description: 'Operational audit of store campaign activity, 4-channel touchpoint coverage, and quota utilization.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function StoreReportRoute({ params }: PageProps) {
  const { businessId } = await params;
  const reportData = await getStoreReport(businessId);

  if (!reportData) {
    notFound();
  }

  return <ReportPage report={reportData} />;
}
