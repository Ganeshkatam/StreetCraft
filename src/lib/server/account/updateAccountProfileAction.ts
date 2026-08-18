'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';

const parseCheckbox = (val: unknown): boolean => {
  return val === 'on' || val === 'true' || val === true;
};

const UpdateProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100, 'Name cannot exceed 100 characters.'),
  phone: z.string().superRefine((val, ctx) => {
    const trimmed = val.trim();
    if (trimmed === '') return;
    if (trimmed.length > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 20,
        type: 'string',
        inclusive: true,
        message: 'Phone number cannot exceed 20 characters.',
      });
      return;
    }
    if (!/^[+\d\s\-()]+$/.test(trimmed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone number contains invalid characters.',
      });
    }
  }),
  emailNotifs: z.boolean(),
  whatsappNotifs: z.boolean(),
  weeklyDigest: z.boolean(),
});

export type UpdateAccountProfileActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function updateAccountProfileAction(
  prevState: UpdateAccountProfileActionState | null,
  formData: FormData
): Promise<UpdateAccountProfileActionState> {
  try {
    const rawFullName = formData.get('fullName');
    const rawPhone = formData.get('phone');
    const rawEmailNotifs = formData.get('emailNotifs');
    const rawWhatsappNotifs = formData.get('whatsappNotifs');
    const rawWeeklyDigest = formData.get('weeklyDigest');

    const parsed = UpdateProfileSchema.safeParse({
      fullName: typeof rawFullName === 'string' ? rawFullName : '',
      phone: typeof rawPhone === 'string' ? rawPhone : '',
      emailNotifs: parseCheckbox(rawEmailNotifs),
      whatsappNotifs: parseCheckbox(rawWhatsappNotifs),
      weeklyDigest: parseCheckbox(rawWeeklyDigest),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: 'Please fix the errors below.',
        errors: parsed.error.flatten().fieldErrors,
      };
    }

    const { fullName, phone, emailNotifs, whatsappNotifs, weeklyDigest } = parsed.data;

    // 1. Authenticate caller (identity invariant: profiles.id = claims.userId)
    const claims = await requireAuthenticatedClaims('/user/account');
    const supabase = await createClient();

    const trimmedPhone = phone.trim();
    const finalPhone = trimmedPhone === '' ? null : trimmedPhone;

    // 2. Perform RLS-protected update on user's own profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: finalPhone,
        notification_preferences: {
          email: emailNotifs,
          whatsapp: whatsappNotifs,
          weekly_digest: weeklyDigest,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', claims.userId);

    if (updateError) {
      console.error('updateAccountProfileAction error:', updateError);
      return {
        success: false,
        message: 'Failed to update profile preferences. Please try again.',
      };
    }

    // 3. Dependency-driven revalidation
    revalidatePath('/user/account');
    revalidatePath('/user/today');

    return {
      success: true,
      message: 'Account profile and preferences updated successfully.',
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('updateAccountProfileAction error:', err);
    return {
      success: false,
      message: 'Authentication failed or an unexpected error occurred.',
    };
  }
}
