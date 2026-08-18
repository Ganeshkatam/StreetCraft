import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { createClient } from '../../supabase/server';
import type { StoreReportViewModel } from '../../domain/report/reportTypes';
import {
  deriveCampaignStatusCounts,
  deriveChannelCoverage,
  deriveGenerationUsage,
  deriveTimelineItems,
  deriveReportInsights,
} from '../../domain/report/reportMetrics';

export async function getStoreReport(candidateBizId: string): Promise<StoreReportViewModel | null> {
  const claims = await requireAuthenticatedClaims(`/user/business/${candidateBizId}/report`);
  const supabase = await createClient();

  const business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);
  if (!business) {
    return null;
  }

  // 1. Fetch store profile details
  const { data: profile } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('business_id', business.id)
    .maybeSingle();

  // 2. Fetch all campaigns for this store
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, type, status, offer, schedule, performance_notes, created_at, updated_at')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false });

  const campaignList = campaigns || [];
  const campaignIds = campaignList.map((c) => c.id);

  // 3. Fetch all campaign outputs for these campaigns
  let outputs: Array<{ id: string; campaign_id: string; channel: string; validation_status?: string }> = [];
  if (campaignIds.length > 0) {
    const { data: rawOutputs } = await supabase
      .from('campaign_outputs')
      .select('id, campaign_id, channel, validation_status')
      .in('campaign_id', campaignIds);
    outputs = rawOutputs || [];
  }

  // 4. Fetch current usage period
  const { data: usagePeriod } = await supabase
    .from('usage_periods')
    .select('*')
    .eq('business_id', business.id)
    .gte('period_end', new Date().toISOString().split('T')[0])
    .order('period_end', { ascending: false })
    .limit(1)
    .maybeSingle();

  // 5. Fetch subscription / plan name
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, plan_id, status, plans ( name )')
    .eq('user_id', claims.userId)
    .in('status', ['ACTIVE', 'TRIALING'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const planName = (sub?.plans as { name?: string } | null)?.name || 'Starter Plan';

  // 6. Build typed ViewModel
  const snapshot = {
    id: business.id,
    name: business.name || profile?.name || 'My Storefront',
    category: business.category || profile?.category || 'RETAIL',
    neighborhood: profile?.neighborhood || '',
    city: profile?.city || '',
    landmarks: profile?.landmarks || null,
    signatureItems: profile?.signature_items || null,
    phoneWhatsapp: profile?.phone_whatsapp || null,
  };

  const activity = deriveCampaignStatusCounts(campaignList);
  const coverage = deriveChannelCoverage(outputs, campaignList.length);
  const usage = deriveGenerationUsage(usagePeriod, planName);
  const timeline = deriveTimelineItems(campaignList);
  const insights = deriveReportInsights(activity, coverage, usage, timeline, snapshot);

  return {
    businessId: business.id,
    generatedAt: new Date().toISOString(),
    snapshot,
    campaignActivity: activity,
    channelCoverage: coverage,
    generationUsage: usage,
    timeline,
    insights,
  };
}
