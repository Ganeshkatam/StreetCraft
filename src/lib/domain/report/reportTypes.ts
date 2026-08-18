export interface StoreSnapshotViewModel {
  id: string;
  name: string;
  category: string;
  neighborhood: string;
  city: string;
  landmarks: string | null;
  signatureItems: string | null;
  phoneWhatsapp: string | null;
}

export interface CampaignStatusCounts {
  draft: number;
  ready: number;
  published: number;
  completed: number;
  archived: number;
  total: number;
}

export interface ChannelCoverageItem {
  channel: string;
  label: string;
  count: number;
  percentage: number;
}

export interface ChannelCoverageViewModel {
  googleBusiness: ChannelCoverageItem;
  instagram: ChannelCoverageItem;
  whatsapp: ChannelCoverageItem;
  inStorePoster: ChannelCoverageItem;
  totalOutputs: number;
  averageOutputsPerCampaign: number;
}

export interface GenerationUsageViewModel {
  planTier: string;
  planName: string;
  packLimit: number;
  packsUsed: number;
  packsRemaining: number;
  utilizationPercentage: number;
  periodStart: string | null;
  periodEnd: string | null;
}

export interface CampaignTimelineItem {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
  publishedAt: string | null;
  hasPerformanceNotes: boolean;
  notesSnippet: string | null;
}

export type ReportInsightType = 'OPPORTUNITY' | 'CADENCE' | 'COVERAGE' | 'OPERATIONS';

export interface ReportInsightItem {
  id: string;
  type: ReportInsightType;
  badge: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export interface StoreReportViewModel {
  businessId: string;
  generatedAt: string;
  snapshot: StoreSnapshotViewModel;
  campaignActivity: CampaignStatusCounts;
  channelCoverage: ChannelCoverageViewModel;
  generationUsage: GenerationUsageViewModel;
  timeline: CampaignTimelineItem[];
  insights: ReportInsightItem[];
}
