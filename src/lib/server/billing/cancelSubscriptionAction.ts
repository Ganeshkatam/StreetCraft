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
    await requireAuthenticatedClaims('/app/billing');
    const supabase = await createClient();

    // 2. Execute transactional RPC to schedule cancellation at period end
    // The RPC locks the active subscription row, sets cancel_at_period_end = true,
    // and records the audit event without prematurely destroying the active usage_periods.
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
        message: 'Failed to schedule subscription cancellation: ' + rpcError.message,
      };
    }

    // 3. Revalidate affected surfaces
    revalidatePath('/app/billing');
    revalidatePath('/app/account');
    revalidatePath('/app/today');

    const periodEndStr = (rpcResult as any)?.current_period_end 
      ? new Date((rpcResult as any).current_period_end).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'the end of the cycle';

    if ((rpcResult as any)?.already_scheduled === true) {
      return {
        success: true,
        message: `Subscription cancellation is already scheduled for ${periodEndStr}. No further action needed.`,
        data: rpcResult,
      };
    }

    return {
      success: true,
      message: `Your subscription is scheduled to cancel on ${periodEndStr}. Your full campaign quota and store features remain active until then.`,
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
