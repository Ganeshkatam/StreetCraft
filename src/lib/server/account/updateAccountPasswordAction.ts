'use server';

import { z } from 'zod';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';

const UpdatePasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters long.').max(128, 'Password cannot exceed 128 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type UpdatePasswordActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateAccountPasswordAction(
  prevState: UpdatePasswordActionState,
  formData: FormData
): Promise<UpdatePasswordActionState> {
  try {
    const rawNewPassword = formData.get('newPassword');
    const rawConfirmPassword = formData.get('confirmPassword');

    const parsed = UpdatePasswordSchema.safeParse({
      newPassword: typeof rawNewPassword === 'string' ? rawNewPassword : '',
      confirmPassword: typeof rawConfirmPassword === 'string' ? rawConfirmPassword : '',
    });

    if (!parsed.success) {
      return {
        success: false,
        message: 'Please fix the errors below.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { newPassword } = parsed.data;

    // 1. Authenticate caller claims
    await requireAuthenticatedClaims('/user/account/security');
    const supabase = await createClient();

    // 2. Delegate password update strictly to Supabase Auth
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (authError) {
      return {
        success: false,
        message: authError.message || 'Failed to update password. Please try again.',
      };
    }

    return {
      success: true,
      message: 'Password updated successfully.',
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('updateAccountPasswordAction error:', err);
    return {
      success: false,
      message: 'Failed to update password. An unexpected error occurred.',
    };
  }
}
