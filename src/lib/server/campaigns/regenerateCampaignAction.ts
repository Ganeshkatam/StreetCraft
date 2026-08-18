'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { getAccessibleBusinesses } from '../business/getAccessibleBusinesses';
import { getBusinessProfile } from '../business/getBusinessProfile';
import { generateCampaignPack, CampaignGenerationInput } from '../../../engine/campaignEngine';
import { createClient } from '../../supabase/server';
import { CampaignType, CampaignObjective, StructuredOffer, StructuredSchedule } from '../../../types/campaign';

const RegenerateCampaignSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID format.'),
  expectedGenerationRevision: z.coerce.number().int().min(0, 'Invalid generation revision.'),
});

export type RegenerateCampaignActionState = {
  success: boolean;
  message: string;
  data?: any;
};

export async function regenerateCampaignAction(
  _prevState: RegenerateCampaignActionState | null,
  formData: FormData
): Promise<RegenerateCampaignActionState> {
  try {
    const rawCampaignId = formData.get('campaignId');
    const rawRevision = formData.get('expectedGenerationRevision');

    const parsed = RegenerateCampaignSchema.safeParse({
      campaignId: rawCampaignId,
      expectedGenerationRevision: rawRevision,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: 'Invalid input. ' + parsed.error.issues[0].message,
      };
    }

    const { campaignId, expectedGenerationRevision } = parsed.data;

    // 1. Authenticate caller
    const claims = await requireAuthenticatedClaims('/user/campaigns');
    const supabase = await createClient();

    // 2. Pre-fetch campaign details for authorization and LLM context
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, business_id, type, objective, audience, offer, schedule, status, generation_revision')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign || !campaign.business_id) {
      return { success: false, message: 'Campaign not found.' };
    }

    // 3. Defense in depth: Verify membership and role
    const accessibleBusinesses = await getAccessibleBusinesses(claims.userId);
    const membership = accessibleBusinesses.find(b => b.id === campaign.business_id);

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      return { success: false, message: 'Unauthorized. Only business owners and admins can regenerate campaigns.' };
    }

    // 4. Verify regenerable state (READY or FAILED only)
    const upperStatus = (campaign.status || '').toUpperCase();
    if (upperStatus !== 'READY' && upperStatus !== 'FAILED') {
      return {
        success: false,
        message: `Cannot regenerate campaign with status ${campaign.status}. Only READY or FAILED campaigns can be regenerated.`,
      };
    }

    // 5. Pre-check optimistic concurrency revision
    const currentRevision = typeof campaign.generation_revision === 'number' ? campaign.generation_revision : 0;
    if (currentRevision !== expectedGenerationRevision) {
      return {
        success: false,
        message: 'Campaign was modified or regenerated concurrently. Please refresh the page.',
      };
    }

    // 6. Fetch store profile context for generation
    const profile = await getBusinessProfile(campaign.business_id);
    if (!profile) {
      return { success: false, message: 'Business profile not found. Please complete store setup.' };
    }

    // 7. Generation Pipeline (Run LLM outside database transaction)
    const rawOffer = (campaign.offer as unknown as StructuredOffer) || ({} as StructuredOffer);
    const rawSchedule = (campaign.schedule as unknown as StructuredSchedule) || ({} as StructuredSchedule);

    const generationInput: CampaignGenerationInput = {
      type: campaign.type as CampaignType,
      objective: campaign.objective as CampaignObjective,
      audience: campaign.audience || profile.target_customer || 'Neighborhood residents and visitors',
      offer: {
        title: rawOffer.title || 'Special Offer',
        description: rawOffer.description || 'Special promotional campaign for our customers.',
        value: rawOffer.value || 'Special Promotional Value',
        terms: rawOffer.terms || 'Show message at counter to redeem.',
      },
      schedule: {
        startsAt: rawSchedule.startsAt || new Date().toISOString(),
        endsAt: rawSchedule.endsAt || new Date(Date.now() + 7 * 86400000).toISOString(),
        timingLabel: rawSchedule.timingLabel || 'Valid this week',
      },
    };

    const { outputs } = generateCampaignPack(profile, generationInput);

    // 8. Atomic output replacement & quota deduction via transactional RPC
    const { data: rpcResult, error: rpcError } = await supabase.rpc('replace_campaign_outputs_atomically', {
      p_campaign_id: campaignId,
      p_expected_generation_revision: expectedGenerationRevision,
      p_google_content: outputs.googleBusiness,
      p_instagram_content: outputs.instagram,
      p_whatsapp_content: outputs.whatsapp,
      p_poster_content: outputs.poster,
    });

    if (rpcError) {
      if (rpcError.message.includes('ENTITLEMENT_UNAVAILABLE')) {
        return { success: false, message: 'You do not have an active subscription or free trial for this month.' };
      }
      if (rpcError.message.includes('QUOTA_EXHAUSTED')) {
        return { success: false, message: 'Monthly campaign limit reached. Please upgrade your plan to regenerate more.' };
      }
      if (rpcError.message.includes('REGENERATION_CONFLICT')) {
        return { success: false, message: 'Campaign was modified or regenerated concurrently. Please refresh the page.' };
      }
      if (rpcError.message.includes('ILLEGAL_STATE_TRANSITION')) {
        return { success: false, message: 'Cannot regenerate a campaign that has already been published, completed, or archived.' };
      }
      if (rpcError.message.includes('INCOMPLETE_CAMPAIGN_PACK')) {
        return { success: false, message: 'Campaign generation failed to produce all 4 required formats. Please try again.' };
      }
      return { success: false, message: 'Failed to save regenerated campaign: ' + rpcError.message };
    }

    // 9. Revalidate affected routes
    revalidatePath('/user/campaigns');
    revalidatePath(`/user/campaigns/${campaignId}`);
    revalidatePath('/user/today');

    return {
      success: true,
      message: 'Campaign regenerated successfully.',
      data: rpcResult,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('regenerateCampaignAction error:', err);
    return {
      success: false,
      message: 'Authentication failed or an unexpected error occurred.',
    };
  }
}
