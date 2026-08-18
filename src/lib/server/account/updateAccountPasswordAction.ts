'use server';

import { z } from 'zod';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';

const RequestOtpSchema = z.object({
  email: z.string().email(),
});

const VerifyAndUpdatePasswordSchema = z
  .object({
    otpCode: z.string().trim().min(6, 'Verification code must be 6 digits.').max(10, 'Invalid verification code.'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters long.').max(128, 'Password cannot exceed 128 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type SecurityActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

/**
 * Sends a 6-digit OTP verification code to the operator's authenticated email.
 */
export async function sendPasswordOtpAction(): Promise<SecurityActionState> {
  try {
    const claims = await requireAuthenticatedClaims('/user/account');
    const supabase = await createClient();

    const userEmail = claims.email || '';
    if (!userEmail) {
      return {
        success: false,
        message: 'No verified email associated with this account.',
      };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: userEmail,
      options: {
        shouldCreateUser: false,
      },
    });

    if (error) {
      console.warn('Supabase OTP send warning:', error.message);
      // If rate limited or provider limitation, return clear guidance
      return {
        success: false,
        message: error.message || 'Could not send verification code. Please try again in a moment.',
      };
    }

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${userEmail}.`,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('sendPasswordOtpAction error:', err);
    return {
      success: false,
      message: 'Authentication required or request failed.',
    };
  }
}

/**
 * Verifies OTP code and applies new password.
 */
export async function updateAccountPasswordAction(
  prevState: SecurityActionState | null,
  formData: FormData
): Promise<SecurityActionState> {
  try {
    const rawOtp = formData.get('otpCode');
    const rawNewPassword = formData.get('newPassword');
    const rawConfirmPassword = formData.get('confirmPassword');

    const parsed = VerifyAndUpdatePasswordSchema.safeParse({
      otpCode: typeof rawOtp === 'string' ? rawOtp : '',
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

    const { otpCode, newPassword } = parsed.data;

    // 1. Authenticate caller claims
    const claims = await requireAuthenticatedClaims('/user/account');
    const supabase = await createClient();

    const userEmail = claims.email || '';
    if (!userEmail) {
      return {
        success: false,
        message: 'No verified email associated with this account.',
      };
    }

    // 2. Verify OTP token for this user's email
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: userEmail,
      token: otpCode,
      type: 'email',
    });

    if (verifyError) {
      // Also try recovery type if email type differs
      const { error: recoveryError } = await supabase.auth.verifyOtp({
        email: userEmail,
        token: otpCode,
        type: 'recovery',
      });

      if (recoveryError) {
        return {
          success: false,
          message: 'Invalid or expired verification code. Please check the code or request a new one.',
          errors: {
            otpCode: ['Invalid or expired verification code.'],
          },
        };
      }
    }

    // 3. Delegate password update strictly to Supabase Auth
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
