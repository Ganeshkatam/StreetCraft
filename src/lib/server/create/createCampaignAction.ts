'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';
import { getBusinessProfile } from '../business/getBusinessProfile';
import { generateCampaignPack, CampaignGenerationInput } from '../../../engine/campaignEngine';
import { createClient } from '../../supabase/server';
import { CampaignType, CampaignObjective } from '../../../types/campaign';

const CampaignTypeEnum = z.enum([
  'WEEKDAY_BOOST',
  'WEEKEND_MAGNET',
  'MENU_LAUNCH',
  'FESTIVAL_SPECIAL',
  'REVIEW_SPOTLIGHT',
  'WIN_BACK_REGULARS'
]);

const CampaignObjectiveEnum = z.enum([
  'MORE_WALK_INS',
  'MORE_ORDERS',
  'MORE_BOOKINGS',
  'PROMOTE_PRODUCT',
  'BRING_BACK_CUSTOMERS',
  'REPEAT_VISITS',
  'INCREASE_AWARENESS',
  'WEEKEND_CROWD',
  'FESTIVAL_RUSH',
  'MORE_REVIEWS',
  'CUSTOMER_RETENTION'
]);

const emptyStringIfEmpty = (val: unknown) => {
  if (typeof val !== 'string') return '';
  return val.trim();
};

const CreateCampaignSchema = z.object({
  businessId: z.string().uuid(),
  type: CampaignTypeEnum,
  objective: CampaignObjectiveEnum,
  audience: z.preprocess(emptyStringIfEmpty, z.string().max(200)),
  offerTitle: z.string().trim().min(2, 'Offer headline is required').max(100),
  offerDesc: z.string().trim().min(2, 'Offer description is required').max(300),
  offerValue: z.preprocess(emptyStringIfEmpty, z.string().max(100)),
  offerTerms: z.preprocess(emptyStringIfEmpty, z.string().max(200)),
  startsAt: z.string().datetime().or(z.string()),
  endsAt: z.string().datetime().or(z.string()),
  timingLabel: z.preprocess(emptyStringIfEmpty, z.string().max(100)),
  customNotes: z.preprocess(emptyStringIfEmpty, z.string().max(500)),
});

export type CreateCampaignActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: any;
};

export async function createCampaignAction(
  prevState: CreateCampaignActionState | null,
  formData: FormData
): Promise<CreateCampaignActionState> {
  try {
    const claims = await requireAuthenticatedClaims('/app/create');

    const rawData = {
      businessId: formData.get('businessId'),
      type: formData.get('type'),
      objective: formData.get('objective'),
      audience: formData.get('audience'),
      offerTitle: formData.get('offerTitle'),
      offerDesc: formData.get('offerDesc'),
      offerValue: formData.get('offerValue'),
      offerTerms: formData.get('offerTerms'),
      startsAt: formData.get('startsAt') || new Date().toISOString(),
      endsAt: formData.get('endsAt') || new Date(Date.now() + 7 * 86400000).toISOString(),
      timingLabel: formData.get('timingLabel'),
      customNotes: formData.get('customNotes'),
    };

    const validated = CreateCampaignSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        message: 'Please fix the errors below.',
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const input = validated.data;

    // Authorize tenant access
    const business = await resolveAuthorizedBusiness(claims.userId, input.businessId);
    if (!business) {
      return { success: false, message: 'UNAUTHORIZED: Cannot access this business.' };
    }

    // Load business profile for LLM generation context
    const profile = await getBusinessProfile(business.id);
    if (!profile) {
      return { success: false, message: 'Business profile not found. Please complete store setup.' };
    }

    // Step 2: Generation Pipeline (Synchronous LLM / rule-based generation)
    const generationInput: CampaignGenerationInput = {
      type: input.type as CampaignType,
      objective: input.objective as CampaignObjective,
      audience: input.audience || profile.target_customer || 'Neighborhood residents and visitors',
      offer: {
        title: input.offerTitle,
        description: input.offerDesc,
        value: input.offerValue || 'Special Promotional Value',
        terms: input.offerTerms || 'Show message at counter to redeem.',
      },
      schedule: {
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        timingLabel: input.timingLabel || 'Valid this week',
      },
      customNotes: input.customNotes,
    };

    const { outputs } = generateCampaignPack(profile, generationInput);

    // Step 3: Atomic Persistence & Quota Deduction via RPC
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
      // Map postgres exceptions gracefully
      if (rpcError.message.includes('ENTITLEMENT_UNAVAILABLE')) {
        return { success: false, message: 'You do not have an active subscription or free trial for this month.' };
      }
      if (rpcError.message.includes('QUOTA_EXHAUSTED')) {
        return { success: false, message: 'Monthly campaign limit reached. Please upgrade to generate more.' };
      }
      if (rpcError.message.includes('INCOMPLETE_CAMPAIGN_PACK')) {
        return { success: false, message: 'Campaign generation failed. Please try again.' };
      }
      return { success: false, message: 'An unexpected error occurred while saving the campaign.' };
    }

    revalidatePath('/app/campaigns');
    revalidatePath('/app/today');

    return {
      success: true,
      message: 'Campaign created successfully.',
      data: {
        campaign: {
          offer: generationInput.offer,
          schedule: generationInput.schedule,
          objective: generationInput.objective,
          type: generationInput.type
        },
        outputs
      },
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    return {
      success: false,
      message: 'Authentication failed or an unexpected error occurred.',
    };
  }
}
