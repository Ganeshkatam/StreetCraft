import type {
  CampaignStatusCounts,
  ChannelCoverageViewModel,
  GenerationUsageViewModel,
  CampaignTimelineItem,
  ReportInsightItem,
  StoreSnapshotViewModel,
} from './reportTypes';

interface RawCampaignRow {
  id: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  offer?: unknown;
  performance_notes?: string | null;
}

interface RawOutputRow {
  id: string;
  campaign_id: string;
  channel: string;
  validation_status?: string;
}

interface RawUsagePeriodRow {
  plan: string;
  pack_limit: number;
  packs_used: number;
  period_start: string;
  period_end: string;
}

export function deriveCampaignStatusCounts(campaigns: RawCampaignRow[]): CampaignStatusCounts {
  const counts: CampaignStatusCounts = {
    draft: 0,
    ready: 0,
    published: 0,
    completed: 0,
    archived: 0,
    total: campaigns.length,
  };

  for (const c of campaigns) {
    const s = (c.status || '').toUpperCase();
    if (s === 'DRAFT') counts.draft++;
    else if (s === 'READY' || s === 'GENERATED') counts.ready++;
    else if (s === 'PUBLISHED') counts.published++;
    else if (s === 'COMPLETED') counts.completed++;
    else if (s === 'ARCHIVED') counts.archived++;
    else counts.ready++; // default to ready for generated states
  }

  return counts;
}

export function deriveChannelCoverage(
  outputs: RawOutputRow[],
  totalCampaigns: number
): ChannelCoverageViewModel {
  let google = 0;
  let insta = 0;
  let wa = 0;
  let poster = 0;

  for (const out of outputs) {
    const ch = (out.channel || '').toUpperCase();
    if (ch.includes('GOOGLE') || ch === 'GBP') google++;
    else if (ch.includes('INSTA')) insta++;
    else if (ch.includes('WHATSAPP') || ch === 'WA') wa++;
    else if (ch.includes('POSTER') || ch.includes('PRINT')) poster++;
  }

  const totalOutputs = outputs.length;
  const safeTotal = totalCampaigns > 0 ? totalCampaigns : 1;

  return {
    googleBusiness: {
      channel: 'GOOGLE_BUSINESS',
      label: 'Google Business Profile',
      count: google,
      percentage: totalCampaigns > 0 ? Math.min(100, Math.round((google / safeTotal) * 100)) : 0,
    },
    instagram: {
      channel: 'INSTAGRAM',
      label: 'Instagram (Reels & Stories)',
      count: insta,
      percentage: totalCampaigns > 0 ? Math.min(100, Math.round((insta / safeTotal) * 100)) : 0,
    },
    whatsapp: {
      channel: 'WHATSAPP',
      label: 'WhatsApp Broadcasts',
      count: wa,
      percentage: totalCampaigns > 0 ? Math.min(100, Math.round((wa / safeTotal) * 100)) : 0,
    },
    inStorePoster: {
      channel: 'IN_STORE_POSTER',
      label: 'In-Store Print & Tent Cards',
      count: poster,
      percentage: totalCampaigns > 0 ? Math.min(100, Math.round((poster / safeTotal) * 100)) : 0,
    },
    totalOutputs,
    averageOutputsPerCampaign: totalCampaigns > 0 ? Number((totalOutputs / totalCampaigns).toFixed(1)) : 0,
  };
}

export function deriveGenerationUsage(
  usagePeriod: RawUsagePeriodRow | null,
  planName = 'Starter Plan'
): GenerationUsageViewModel {
  const packLimit = usagePeriod?.pack_limit ?? 3;
  const packsUsed = usagePeriod?.packs_used ?? 0;
  const packsRemaining = Math.max(0, packLimit - packsUsed);
  const utilizationPercentage = packLimit > 0 ? Math.min(100, Math.round((packsUsed / packLimit) * 100)) : 0;
  const planTier = (usagePeriod?.plan || 'FREE').toUpperCase();

  return {
    planTier,
    planName: planTier === 'FOUNDER' ? 'Founder Lifetime Tier' : planName,
    packLimit,
    packsUsed,
    packsRemaining,
    utilizationPercentage,
    periodStart: usagePeriod?.period_start ?? null,
    periodEnd: usagePeriod?.period_end ?? null,
  };
}

export function deriveTimelineItems(campaigns: RawCampaignRow[]): CampaignTimelineItem[] {
  return campaigns.slice(0, 10).map((c) => {
    let title = 'Campaign Promotion';
    if (c.offer && typeof c.offer === 'object' && 'title' in (c.offer as Record<string, unknown>)) {
      title = String((c.offer as Record<string, unknown>).title);
    } else if (c.type) {
      title = `${c.type.replace(/_/g, ' ')} Campaign`;
    }

    const notes = c.performance_notes ? c.performance_notes.trim() : null;

    return {
      id: c.id,
      title,
      type: c.type || 'CUSTOM_OFFER',
      status: (c.status || 'DRAFT').toUpperCase(),
      createdAt: c.created_at,
      publishedAt: c.status === 'PUBLISHED' || c.status === 'COMPLETED' ? c.updated_at : null,
      hasPerformanceNotes: Boolean(notes && notes.length > 0),
      notesSnippet: notes && notes.length > 80 ? `${notes.slice(0, 80)}...` : notes,
    };
  });
}

export function deriveReportInsights(
  activity: CampaignStatusCounts,
  coverage: ChannelCoverageViewModel,
  usage: GenerationUsageViewModel,
  _timeline: CampaignTimelineItem[],
  snapshot: StoreSnapshotViewModel
): ReportInsightItem[] {
  const insights: ReportInsightItem[] = [];

  // Insight 1: Store Setup Readiness
  if (!snapshot.neighborhood || !snapshot.signatureItems) {
    insights.push({
      id: 'setup-context',
      type: 'OPERATIONS',
      badge: 'CONTEXT GAP',
      title: 'Enrich Signature Items & Neighborhood Landmarks',
      description:
        'Your store profile is missing landmark anchors or signature items. Completing these ensures generated campaigns feature specific local proof.',
      actionHref: `/setup/${snapshot.id}/location`,
      actionLabel: 'Complete Store Context',
    });
  }

  // Insight 2: Channel Completeness
  if (activity.total > 0 && coverage.averageOutputsPerCampaign < 4) {
    insights.push({
      id: 'channel-coverage',
      type: 'COVERAGE',
      badge: 'CHANNEL SYNERGY',
      title: 'Expand 4-Channel Distribution',
      description: `Your campaigns average ${coverage.averageOutputsPerCampaign} touchpoints out of 4. Coordinated deployment across Google, Instagram, WhatsApp, and counter print drives maximum physical footfall.`,
      actionHref: '/user/create',
      actionLabel: 'Generate 4-Touchpoint Pack',
    });
  }

  // Insight 3: Quota Utilization
  if (usage.packsRemaining > 0) {
    insights.push({
      id: 'quota-available',
      type: 'OPPORTUNITY',
      badge: 'GENERATION QUOTA',
      title: `${usage.packsRemaining} Campaign ${usage.packsRemaining === 1 ? 'Pack' : 'Packs'} Available This Month`,
      description: `You have ${usage.packsRemaining} unused campaign ${usage.packsRemaining === 1 ? 'allocation' : 'allocations'} remaining in your current billing cycle.`,
      actionHref: '/user/create',
      actionLabel: 'Create New Campaign',
    });
  }

  // Insight 4: Operational Cadence
  if (activity.total === 0) {
    insights.push({
      id: 'first-campaign',
      type: 'CADENCE',
      badge: 'GETTING STARTED',
      title: 'Deploy Your First Store Campaign',
      description:
        'Select a slow weekday window or signature item to generate your first synchronized 4-touchpoint marketing pack.',
      actionHref: '/user/create',
      actionLabel: 'Launch First Campaign',
    });
  } else if (activity.published === 0 && activity.ready > 0) {
    insights.push({
      id: 'uncommitted-campaigns',
      type: 'CADENCE',
      badge: 'DEPLOYMENT CADENCE',
      title: 'Move Generated Packs to Published',
      description: `You have ${activity.ready} ready campaign ${activity.ready === 1 ? 'pack' : 'packs'} awaiting deployment. Update status once broadcasted or printed to maintain an accurate audit log.`,
      actionHref: '/user/campaigns',
      actionLabel: 'View Campaign Vault',
    });
  }

  return insights;
}
