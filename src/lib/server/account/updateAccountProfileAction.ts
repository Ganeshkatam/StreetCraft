'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';

const UpdateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(80, 'Full name must be less than 80 characters.'),
  phone: z
    .string()
    .trim()
    .max(30, 'Phone number must be less than 30 characters.')
    .optional()
    .nullable()
    .transform((val) => (val && val.length > 0 ? val : null)),
});

export type UpdateProfileActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateAccountProfileAction(
  _prevState: UpdateProfileActionState,
  formData: FormData
): Promise<UpdateProfileActionState> {
  try {
    const claims = await requireAuthenticatedClaims('/user/account/identity');
    const supabase = await createClient();

    const rawData = {
      fullName: formData.get('fullName'),
      phone: formData.get('phone'),
    };

    const parsed = UpdateProfileSchema.safeParse(rawData);
    if (!parsed.success) {
      return {
        success: false,
        message: 'Invalid profile data provided.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: parsed.data.fullName,
        phone: parsed.data.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', claims.userId);

    if (updateError) {
      console.error('updateAccountProfileAction database error:', updateError);
      return {
        success: false,
        message: updateError.message || 'Failed to update profile.',
      };
    }

    revalidatePath('/user/account');
    revalidatePath('/user/account/identity');
    revalidatePath('/user/today');

    return {
      success: true,
      message: 'Profile updated successfully.',
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('updateAccountProfileAction unexpected error:', err);
    return {
      success: false,
      message: 'An unexpected error occurred while updating profile.',
    };
  }
}
