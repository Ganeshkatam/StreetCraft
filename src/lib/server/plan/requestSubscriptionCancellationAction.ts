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
  prevState: CancellationActionState,
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

    // Call RPC or update cancel_at_period_end on verified user subscription
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parsed.data.subscriptionId)
      .eq('user_id', claims.userId);

    if (updateError) {
      console.error('Cancellation request error:', updateError);
      return {
        success: false,
        message: 'Could not process cancellation request. Please contact support.',
      };
    }

    revalidatePath('/user/account/plan');
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
