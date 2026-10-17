'use server';

import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';
import { RequestCancellationSchema } from '../../domain/plan/planSchemas';

export type CancellationActionState = {
  success: boolean;
  message?: string;
};

export async function requestSubscriptionCancellationAction(
  _prevState: CancellationActionState,
  formData: FormData
): Promise<CancellationActionState> {
  try {
    const claims = await requireAuthenticatedClaims('/user/account/plan');
    const supabase = await createClient();

    const parsed = RequestCancellationSchema.safeParse({
      subscriptionId: formData.get('subscriptionId'),
      reason: formData.get('reason') || undefined,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: 'Invalid cancellation request parameters.',
      };
    }

    // Invoke trusted database RPC to cancel subscription safely
    const { data: _rpcResult, error: rpcError } = await supabase.rpc('request_subscription_cancellation');

    if (rpcError) {
      console.error('request_subscription_cancellation RPC error:', rpcError.message);
      if (rpcError.message.includes('NO_ACTIVE_SUBSCRIPTION')) {
        return {
          success: false,
          message: 'No active paid subscription found to cancel.',
        };
      }
      return {
        success: false,
        message: 'Could not process cancellation request. Please contact support.',
      };
    }

    revalidatePath('/user/account/plan');
    revalidatePath('/user/myplan');
    return {
      success: true,
      message: 'Your subscription will remain active until the end of the current billing cycle.',
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('requestSubscriptionCancellationAction unexpected error:', err);
    return {
      success: false,
      message: 'An unexpected error occurred.',
    };
  }
}
