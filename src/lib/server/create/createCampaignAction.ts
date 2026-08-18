'use server';

import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { getBusinessProfile } from '../business/getBusinessProfile';
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
  prevState: CreateCampaignActionState,
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

    // 4. Load Store Profile
    const profile = await getBusinessProfile(business.id);
    if (!profile) {
      return {
        success: false,
        errorCode: 'UNAUTHORIZED_BUSINESS',
        message: 'Storefront profile not found. Please complete store setup first.',
      };
    }

    // 5. Build Generation Input & Generate Pack Outside DB Transaction
    const generationInput: CampaignGenerationInput = {
      type: input.type,
      objective: input.objective,
      audience: input.audience || profile.target_customer || 'Local neighborhood customers',
      offer: {
        title: input.offer.title,
        description: input.offer.description,
        value: input.offer.value || '',
        terms: input.offer.terms || '',
      },
      schedule: {
        startsAt: input.schedule.startDate || '',
        endsAt: input.schedule.endDate || '',
        timingLabel: input.schedule.timingLabel || 'Valid this week',
      },
      customNotes: input.customNotes,
    };

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
