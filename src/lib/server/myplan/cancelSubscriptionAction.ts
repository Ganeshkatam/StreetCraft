'use server';

import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';

export type CancelSubscriptionActionState = {
  success: boolean;
  message: string;
  data?: any;
};

export async function cancelSubscriptionAction(
  prevState: CancelSubscriptionActionState | null,
  formData: FormData
): Promise<CancelSubscriptionActionState> {
  try {
    // 1. Authenticate caller
    await requireAuthenticatedClaims('/user/myplan');
    const supabase = await createClient();

    // 2. Execute transactional RPC to immediately cancel subscription and reset usage periods to Free tier
    const { data: rpcResult, error: rpcError } = await supabase.rpc('request_subscription_cancellation');

    if (rpcError) {
      if (rpcError.message.includes('NO_ACTIVE_SUBSCRIPTION')) {
        return {
          success: false,
          message: 'You do not have an active paid subscription to cancel.',
        };
      }
      return {
        success: false,
        message: 'Failed to cancel subscription: ' + rpcError.message,
      };
    }

    // 3. Revalidate affected surfaces
    revalidatePath('/user/myplan');
    revalidatePath('/user/account');
    revalidatePath('/user/today');
    revalidatePath('/user/create');

    return {
      success: true,
      message: 'Subscription cancelled. Your workspace has been reverted to the Free tier with 3 monthly campaigns.',
      data: rpcResult,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('cancelSubscriptionAction error:', err);
    return {
      success: false,
      message: 'Authentication failed or an unexpected error occurred.',
    };
  }
}
