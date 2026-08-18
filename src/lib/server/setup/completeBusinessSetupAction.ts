'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '../../supabase/server';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../business/resolveAuthorizedBusiness';

const emptyStringIfEmpty = (val: unknown) => {
  if (typeof val !== 'string') return '';
  return val.trim();
};

const CompleteBusinessSetupSchema = z.object({
  signature_items: z.preprocess(emptyStringIfEmpty, z.string().max(300)),
  target_customer: z.preprocess(emptyStringIfEmpty, z.string().max(150)),
  slow_hours: z.preprocess(emptyStringIfEmpty, z.string().max(100)),
  default_offer: z.preprocess(emptyStringIfEmpty, z.string().max(150)),
  phone_whatsapp: z.preprocess(emptyStringIfEmpty, z.string().max(30)),
  claimToken: z.preprocess(emptyStringIfEmpty, z.string().optional()),
});

export type SetupActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function completeBusinessSetupAction(
  candidateBizId: string | undefined,
  prevState: SetupActionState,
  formData: FormData
): Promise<SetupActionState> {
  let targetBizId: string | null = null;

  try {
    // 1. Authenticate caller
    const claims = await requireAuthenticatedClaims('/setup/rhythm');

    // 2. Strict tenant authorization check
    const business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);
    if (!business) {
      return {
        success: false,
        message: 'You do not have authorization to configure this storefront.',
      };
    }

    if (business.role !== 'owner' && business.role !== 'admin') {
      return {
        success: false,
        message: 'Only store owners or admins can finalize store setup.',
      };
    }

    targetBizId = business.id;

    // 3. Schema validation
    const rawData = Object.fromEntries(formData.entries());
    const validationResult = CompleteBusinessSetupSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Please review the fields and fix errors.',
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validData = validationResult.data;

    // 4. Update business profile record
    const supabase = await createClient();
    const { error: updateError } = await supabase
      .from('business_profiles')
      .update({
        signature_items: validData.signature_items,
        target_customer: validData.target_customer,
        slow_hours: validData.slow_hours,
        default_offer: validData.default_offer,
        phone_whatsapp: validData.phone_whatsapp,
        updated_at: new Date().toISOString(),
      })
      .eq('business_id', targetBizId);

    if (updateError) {
      console.error('[Action: completeBusinessSetupAction] Update error:', updateError);
      return {
        success: false,
        message: 'Failed to update store operating rhythm. Please try again.',
      };
    }

    // 5. Consume optional anonymous claim token if present
    if (validData.claimToken) {
      try {
        await (supabase as any).rpc('claim_anonymous_campaign', {
          p_claim_token: validData.claimToken,
          p_business_id: targetBizId,
        });
      } catch (claimErr) {
        console.warn('[Action: completeBusinessSetupAction] Non-fatal claim token error:', claimErr);
      }
    }

    // 6. Revalidation
    revalidatePath('/user/today');
    revalidatePath('/user/business');
    revalidatePath('/user/account');

  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'digest' in err && typeof (err as any).digest === 'string' && (err as any).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('[Action: completeBusinessSetupAction] Unexpected error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred.',
    };
  }

  // 7. Authoritative server redirect to canonical workspace
  redirect(`/user/today?biz=${encodeURIComponent(targetBizId)}`);
}
