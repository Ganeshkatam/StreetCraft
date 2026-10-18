'use server';

import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { getBusinessProfile } from '../business/getBusinessProfile';
import { getCurrentUsagePeriod } from '../usage/getCurrentUsagePeriod';
import { getRecentCampaigns } from '../campaigns/getRecentCampaigns';
import { getFestivalMoments } from '../opportunities/getFestivalMoments';
import { resolveUpcomingFestivals } from '../../../engine/briefing/opportunityEngine';
import {
  buildBrainStoreContext,
  detectBrainOpportunities,
  formulateStrategicBlueprint,
  synthesizeCampaignSpec,
  validateBrainSpecification,
} from '../../../brain/index';
import { createClient } from '../../supabase/server';
import { generateCampaignPack, CampaignGenerationInput } from '../../../engine/campaignEngine';
import { CreateCampaignInputSchema } from '../../domain/create/createSchemas';
import { CampaignPackSchema } from '../../domain/create/campaignPackSchema';
import { mapDatabaseRpcErrorToGenerationError, GenerationErrorCode } from '../../domain/create/generationErrors';

export interface CreateCampaignActionState {
  success: boolean;
  campaignId?: string;
  errorCode?: GenerationErrorCode;
  message: string;
  errors?: Record<string, string[]>;
  data?: any;
}

export async function createCampaignAction(
  _prevState: CreateCampaignActionState,
  formData: FormData
): Promise<CreateCampaignActionState> {
  try {
    // 1. Authenticate
    const claims = await requireAuthenticatedClaims('/user/create');

    // 2. Extract & Validate Inputs
    const rawData = {
      businessId: formData.get('businessId'),
      generationRequestId: formData.get('generationRequestId') || undefined,
      type: formData.get('type'),
      objective: formData.get('objective'),
      audience: formData.get('audience') || undefined,
      offer: {
        title: formData.get('offerTitle'),
        description: formData.get('offerDesc'),
        value: formData.get('offerValue') || undefined,
        terms: formData.get('offerTerms') || undefined,
      },
      schedule: {
        startDate: formData.get('startDate') || undefined,
        endDate: formData.get('endDate') || undefined,
        timingLabel: formData.get('timingLabel') || undefined,
      },
      customNotes: formData.get('customNotes') || undefined,
    };

    const parsed = CreateCampaignInputSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: 'Please fix the errors in your campaign inputs.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const input = parsed.data;

    // 3. Authorize Business
    const business = await resolveAuthorizedBusiness(claims.userId, input.businessId);
    if (!business) {
      return {
        success: false,
        errorCode: 'UNAUTHORIZED_BUSINESS',
        message: 'You are not authorized to create campaigns for this storefront.',
      };
    }

    // 4. Load Store Profile & Intelligence Context
    const [profile, usagePeriod, recentCampaigns, festivals] = await Promise.all([
      getBusinessProfile(business.id),
      getCurrentUsagePeriod(business.id),
      getRecentCampaigns(business.id),
      getFestivalMoments(),
    ]);

    if (!profile) {
      return {
        success: false,
        errorCode: 'UNAUTHORIZED_BUSINESS',
        message: 'Storefront profile not found. Please complete store setup first.',
      };
    }

    // 5. Brain Reasoning & Strategy Synthesis
    const campaignLimit = usagePeriod?.campaign_limit ?? 3;
    const campaignsUsed = usagePeriod?.campaigns_used ?? 0;
    const brainQuota = {
      planTier: (usagePeriod?.plan || 'FREE').toUpperCase(),
      packLimit: campaignLimit,
      packsUsed: campaignsUsed,
      packsRemaining: Math.max(0, campaignLimit - campaignsUsed),
    };

    const upcomingFestivals = resolveUpcomingFestivals(festivals, new Date(), 5);
    const brainContext = buildBrainStoreContext(
      profile as any,
      recentCampaigns as any,
      upcomingFestivals,
      brainQuota,
      new Date()
    );

    const brainOpportunities = detectBrainOpportunities(brainContext);
    const matchedOpportunity = brainOpportunities.find((opp) => opp.preset.type === input.type) || {
      id: `custom-${input.type.toLowerCase()}`,
      type: 'SIGNATURE' as const,
      badge: 'CUSTOM INITIATIVE',
      title: input.offer.title,
      targetWindow: input.schedule.timingLabel || 'Active this week',
      summary: `Tailored campaign for ${brainContext.name}`,
      reasoning: `Custom store campaign aligned to ${input.objective.toLowerCase().replace(/_/g, ' ')}.`,
      confidence: 'HIGH' as const,
      score: 85,
      preset: {
        type: input.type,
        objective: input.objective,
        offer: {
          title: input.offer.title,
          description: input.offer.description,
          value: input.offer.value || '',
          terms: input.offer.terms || '',
        },
        schedule: {
          timingLabel: input.schedule.timingLabel || 'Valid this week',
        },
        customNotes: input.customNotes || '',
      },
      channelFocus: {
        google: 'Local store discoverability and high-intent action',
        instagram: 'Sensory visual storytelling and social engagement',
        whatsapp: 'Direct, personal customer conversation',
        poster: 'High-contrast in-store point of sale conversion',
      },
    };

    const blueprint = formulateStrategicBlueprint(matchedOpportunity, brainContext);
    const enrichedSpec = synthesizeCampaignSpec(blueprint, brainContext, {
      type: input.type,
      objective: input.objective,
      audience: input.audience || undefined,
      offer: {
        title: input.offer.title,
        description: input.offer.description,
        value: input.offer.value || '',
        terms: input.offer.terms || '',
      },
      schedule: {
        startsAt: input.schedule.startDate || '',
        endsAt: input.schedule.endDate || '',
        timingLabel: input.schedule.timingLabel || '',
      },
      customNotes: input.customNotes,
    });

    const specValidation = validateBrainSpecification(enrichedSpec);
    if (!specValidation.valid) {
      return {
        success: false,
        errorCode: 'VALIDATION_ERROR',
        message: specValidation.errors.join(' '),
      };
    }

    const generationInput = enrichedSpec.generationInput;
    const { outputs } = generateCampaignPack(profile, generationInput);

    // 6. Validate Output Completeness
    const validatedPack = CampaignPackSchema.safeParse(outputs);
    if (!validatedPack.success) {
      console.error('Campaign pack output validation failed:', validatedPack.error.flatten());
      return {
        success: false,
        errorCode: 'INCOMPLETE_CAMPAIGN_PACK',
        message: 'Failed to coordinate all four marketing channels. Please retry.',
      };
    }

    // 7. Atomic Persistence & Quota Deduction via RPC
    const supabase = await createClient();
    const { data: rpcResult, error: rpcError } = await supabase.rpc('save_campaign_atomically', {
      p_business_id: business.id,
      p_campaign_type: generationInput.type,
      p_objective: generationInput.objective,
      p_audience: generationInput.audience || '',
      p_offer: generationInput.offer,
      p_schedule: generationInput.schedule,
      p_google_content: outputs.googleBusiness,
      p_instagram_content: outputs.instagram,
      p_whatsapp_content: outputs.whatsapp,
      p_poster_content: outputs.poster,
    });

    if (rpcError) {
      console.error('save_campaign_atomically RPC error:', rpcError);
      const mapped = mapDatabaseRpcErrorToGenerationError(rpcError.message);
      return {
        success: false,
        errorCode: mapped.code,
        message: mapped.message,
      };
    }

    const campaignId = rpcResult?.campaign_id;

    // 8. Revalidation
    revalidatePath('/user/campaigns');
    revalidatePath('/user/today');
    revalidatePath(`/user/campaigns/${campaignId}`);

    return {
      success: true,
      campaignId,
      message: 'Campaign created and coordinated across 4 channels.',
      data: {
        campaignId,
        campaign: {
          id: campaignId,
          offer: generationInput.offer,
          schedule: generationInput.schedule,
          objective: generationInput.objective,
          type: generationInput.type,
        },
        outputs,
      },
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('createCampaignAction unexpected error:', err);
    return {
      success: false,
      errorCode: 'UNEXPECTED_ERROR',
      message: 'An unexpected error occurred while creating the campaign.',
    };
  }
}
