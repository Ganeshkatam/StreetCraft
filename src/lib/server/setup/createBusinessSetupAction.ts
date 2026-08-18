'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '../../supabase/server';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';

const emptyStringIfEmpty = (val: unknown) => {
  if (typeof val !== 'string') return '';
  return val.trim();
};

const CreateBusinessSetupSchema = z.object({
  name: z.string().trim().min(2, 'Store name must be at least 2 characters').max(60, 'Store name must be less than 60 characters'),
  category: z.string().trim().min(2, 'Please select a business category').max(60),
  neighborhood: z.string().trim().min(2, 'Please provide neighborhood / area').max(100),
  city: z.string().trim().min(2, 'Please provide city').max(100),
  landmarks: z.preprocess(emptyStringIfEmpty, z.string().max(150)),
  phone: z.preprocess(emptyStringIfEmpty, z.string().max(30)),
  claimToken: z.preprocess(emptyStringIfEmpty, z.string().optional()),
});

export type SetupActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createBusinessSetupAction(
  prevState: SetupActionState,
  formData: FormData
): Promise<SetupActionState> {
  let createdBusinessId: string | null = null;
  let targetClaimToken: string | null = null;

  try {
    // 1. Authentication boundary
    const claims = await requireAuthenticatedClaims('/setup');

    // 2. Validate input schema
    const rawData = Object.fromEntries(formData.entries());
    const validationResult = CreateBusinessSetupSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Please fill in all required store identity fields.',
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validData = validationResult.data;
    targetClaimToken = validData.claimToken || null;

    // 3. Execute atomic PostgreSQL creation RPC
    const supabase = await createClient();
    const { data: rpcResult, error: rpcError } = await (supabase as any).rpc('create_business_atomically', {
      p_name: validData.name,
      p_category: validData.category,
      p_neighborhood: validData.neighborhood,
      p_city: validData.city,
      p_phone: validData.phone || '',
    });

    if (rpcError || !rpcResult) {
      console.error('[Action: createBusinessSetupAction] RPC error:', rpcError);
      return {
        success: false,
        message: rpcError?.message || 'Failed to create storefront in database. Please try again.',
      };
    }

    createdBusinessId = rpcResult.business_id;

    if (!createdBusinessId) {
      return {
        success: false,
        message: 'Could not resolve created storefront identifier.',
      };
    }

    // 4. Update landmarks if provided
    if (validData.landmarks) {
      await supabase
        .from('business_profiles')
        .update({ landmarks: validData.landmarks })
        .eq('business_id', createdBusinessId);
    }

    // 5. Consume optional anonymous claim token if present
    if (targetClaimToken) {
      try {
        await (supabase as any).rpc('claim_anonymous_campaign', {
          p_claim_token: targetClaimToken,
          p_business_id: createdBusinessId,
        });
      } catch (claimErr) {
        console.warn('[Action: createBusinessSetupAction] Non-fatal claim token error:', claimErr);
      }
    }

    // 6. Revalidation
    revalidatePath('/user/account');
    revalidatePath('/user/business');
    revalidatePath('/user/today');

  } catch (err: unknown) {
    // Rethrow NEXT_REDIRECT
    if (err && typeof err === 'object' && 'digest' in err && typeof (err as any).digest === 'string' && (err as any).digest.startsWith('NEXT_REDIRECT')) {
      throw err;
    }
    console.error('[Action: createBusinessSetupAction] Unexpected error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred during store creation.',
    };
  }

  // 7. Authoritative server-side redirect to Step 2
  const redirectUrl = targetClaimToken
    ? `/setup/rhythm?biz=${encodeURIComponent(createdBusinessId)}&claim=${encodeURIComponent(targetClaimToken)}`
    : `/setup/rhythm?biz=${encodeURIComponent(createdBusinessId)}`;

  redirect(redirectUrl);
}
