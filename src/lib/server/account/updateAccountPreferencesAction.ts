'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';

const UpdatePreferencesSchema = z.object({
  email: z.coerce.boolean(),
  whatsapp: z.coerce.boolean(),
  weekly_digest: z.coerce.boolean(),
});

export type UpdatePreferencesActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateAccountPreferencesAction(
  prevState: UpdatePreferencesActionState,
  formData: FormData
): Promise<UpdatePreferencesActionState> {
  try {
    const claims = await requireAuthenticatedClaims('/user/account/notifications');
    const supabase = await createClient();

    const rawData = {
      email: formData.get('email') === 'on' || formData.get('email') === 'true',
      whatsapp: formData.get('whatsapp') === 'on' || formData.get('whatsapp') === 'true',
      weekly_digest: formData.get('weekly_digest') === 'on' || formData.get('weekly_digest') === 'true',
    };

    const parsed = UpdatePreferencesSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Invalid notification preferences.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        notification_preferences: {
          email: parsed.data.email,
          whatsapp: parsed.data.whatsapp,
          weekly_digest: parsed.data.weekly_digest,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', claims.userId);

    if (updateError) {
      console.error('updateAccountPreferencesAction database error:', updateError);
      return {
        success: false,
        message: updateError.message || 'Failed to update preferences.',
      };
    }

    revalidatePath('/user/account/notifications');

    return {
      success: true,
      message: 'Notification preferences saved.',
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('updateAccountPreferencesAction unexpected error:', err);
    return {
      success: false,
      message: 'An unexpected error occurred.',
    };
  }
}
