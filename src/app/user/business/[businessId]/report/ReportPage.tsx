import React from 'react';
import type { StoreReportViewModel } from '../../../../../lib/domain/report/reportTypes';
import { ReportHeader } from './components/ReportHeader';
import { StoreSnapshot } from './components/StoreSnapshot';
import { CampaignPerformance } from './components/CampaignPerformance';
import { ChannelCoverage } from './components/ChannelCoverage';
import { GenerationUsage } from './components/GenerationUsage';
import { ReportInsights } from './components/ReportInsights';
import { CampaignTimeline } from './components/CampaignTimeline';
import { ReportFooter } from './components/ReportFooter';

interface ReportPageProps {
  report: StoreReportViewModel;
}

export function ReportPage({ report }: ReportPageProps) {
  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px clamp(20px, 3.5vw, 48px) 80px' }}>
      <ReportHeader
        storeName={report.snapshot.name}
        businessId={report.businessId}
        generatedAt={report.generatedAt}
      />

      <StoreSnapshot snapshot={report.snapshot} />

      <CampaignPerformance activity={report.campaignActivity} />

      <ChannelCoverage coverage={report.channelCoverage} />

      <GenerationUsage usage={report.generationUsage} businessId={report.businessId} />

      <ReportInsights insights={report.insights} />

      <CampaignTimeline timeline={report.timeline} businessId={report.businessId} />

      <ReportFooter businessId={report.businessId} />
    </div>
  );
}
