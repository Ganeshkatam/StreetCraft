'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '../../supabase/server';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { getAccessibleBusinesses } from '../business/getAccessibleBusinesses';
import { CreateStoreSchema } from '../../domain/setup/setupSchemas';

export type CreateStoreActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createStoreAction(
  prevState: CreateStoreActionState,
  formData: FormData
): Promise<CreateStoreActionState> {
  let createdBusinessId: string | null = null;
  let targetClaimToken: string | null = null;

  try {
    // 1. Authentication boundary
    const claims = await requireAuthenticatedClaims('/new/store');

    // 2. Validate input schema (only minimal name & category)
    const rawData = Object.fromEntries(formData.entries());
    const validationResult = CreateStoreSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Please provide a valid store name and category.',
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validData = validationResult.data;
    targetClaimToken = validData.claimToken || null;

    // 3. Verify storefront limit / entitlement
    const accessible = await getAccessibleBusinesses(claims.userId);
    const storefrontCount = accessible.length;
    // Free default allows 3 storefronts
    const maxStorefrontsAllowed = 5;
    if (storefrontCount >= maxStorefrontsAllowed) {
      return {
        success: false,
        message: `Storefront limit reached (${maxStorefrontsAllowed} stores). Please upgrade your subscription to connect additional storefronts.`,
      };
    }

    // 4. Execute atomic PostgreSQL creation RPC
    const supabase = await createClient();
    const { data: rpcResult, error: rpcError } = await (supabase as any).rpc('create_business_atomically', {
      p_name: validData.name,
      p_category: validData.category,
      p_neighborhood: '',
      p_city: '',
      p_phone: '',
    });

    if (rpcError || !rpcResult) {
      console.error('[Action: createStoreAction] RPC error:', rpcError);
      return {
        success: false,
        message: rpcError?.message || 'Failed to create storefront. Please try again.',
      };
    }

    createdBusinessId = rpcResult.business_id;

    if (!createdBusinessId) {
      return {
        success: false,
        message: 'Could not resolve created storefront identifier.',
      };
    }

    // 5. Consume optional anonymous claim token if present
    if (targetClaimToken) {
      try {
        await (supabase as any).rpc('claim_anonymous_campaign', {
          p_claim_token: targetClaimToken,
          p_business_id: createdBusinessId,
        });
      } catch (claimErr) {
        console.warn('[Action: createStoreAction] Non-fatal claim token error:', claimErr);
      }
    }

    // 6. Revalidation
    revalidatePath('/user/account');
    revalidatePath('/user/business');
    revalidatePath('/user/today');
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'digest' in err &&
      typeof (err as any).digest === 'string' &&
      (err as any).digest.startsWith('NEXT_REDIRECT')
    ) {
      throw err;
    }
    console.error('[Action: createStoreAction] Unexpected error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'An unexpected error occurred during store creation.',
    };
  }

  // 7. Authoritative server-generated redirect to Step 01 Identity
  const redirectUrl = targetClaimToken
    ? `/setup/${encodeURIComponent(createdBusinessId)}/identity?claim=${encodeURIComponent(targetClaimToken)}`
    : `/setup/${encodeURIComponent(createdBusinessId)}/identity`;

  redirect(redirectUrl);
}
