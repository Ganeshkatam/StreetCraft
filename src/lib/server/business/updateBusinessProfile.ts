'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from './../../../lib/supabase/server';
import { requireAuthenticatedClaims } from './../auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from './resolveAuthorizedBusiness';

const emptyStringIfEmpty = (val: unknown) => {
  if (typeof val !== 'string') return '';
  return val.trim();
};

const coerceNumberOrNull = (val: unknown) => {
  if (val === '' || val === null || val === undefined || val === 0 || val === '0') return null;
  const parsed = Number(val);
  return isNaN(parsed) ? null : parsed;
};

const BusinessProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60, "Name must be less than 60 characters"),
  category: z.string().trim().min(2, "Category must be at least 2 characters").max(60, "Category must be less than 60 characters"),
  neighborhood: z.preprocess(emptyStringIfEmpty, z.string().max(100)),
  city: z.preprocess(emptyStringIfEmpty, z.string().max(100)),
  landmarks: z.preprocess(emptyStringIfEmpty, z.string().max(150)),
  target_customer: z.preprocess(emptyStringIfEmpty, z.string().max(150)),
  style_voice: z.preprocess(emptyStringIfEmpty, z.string().max(150)),
  signature_items: z.preprocess(emptyStringIfEmpty, z.string().max(300)),
  primary_goal: z.preprocess(emptyStringIfEmpty, z.string().max(150)),
  peak_hours: z.preprocess(emptyStringIfEmpty, z.string().max(100)),
  slow_hours: z.preprocess(emptyStringIfEmpty, z.string().max(100)),
  default_offer: z.preprocess(emptyStringIfEmpty, z.string().max(150)),
  avg_ticket_inr: z.preprocess(coerceNumberOrNull, z.number().int().min(1, "Amount must be positive").max(100000, "Amount exceeds limit").nullable()),
  target_monthly_customers: z.preprocess(coerceNumberOrNull, z.number().int().min(1).max(1000000).nullable()),
  phone_whatsapp: z.preprocess(emptyStringIfEmpty, z.string().max(30)),
  logo_url: z.preprocess(emptyStringIfEmpty, z.string().optional()),
});

export type ActionState = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function updateBusinessProfile(
  candidateBizId: string | undefined,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    // 1. Authentication
    const claims = await requireAuthenticatedClaims('/user/business');

    // 2. Candidate resolution and membership authorization
    const business = await resolveAuthorizedBusiness(claims.userId, candidateBizId);
    if (!business) {
      return { success: false, message: 'You do not have access to any store profiles.' };
    }

    // 3. Role authorization
    if (business.role !== 'owner' && business.role !== 'admin') {
      return { success: false, message: 'Only store owners or admins can update the profile.' };
    }

    // 4. Schema validation
    const rawData = Object.fromEntries(formData.entries());
    const validationResult = BusinessProfileSchema.safeParse(rawData);

    if (!validationResult.success) {
      return {
        success: false,
        message: 'Please fix the errors in the form.',
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const validData = validationResult.data;

    // 5. RLS-enforced UPDATE on business_profiles
    const supabase = await createClient();

    // Crucial rule: ONLY UPDATE business_profiles. The trigger trg_sync_business_name_and_category will sync name/category to businesses.
    const { error: updateError } = await supabase
      .from('business_profiles')
      .update({
        name: validData.name,
        category: validData.category,
        neighborhood: validData.neighborhood,
        city: validData.city,
        landmarks: validData.landmarks,
        target_customer: validData.target_customer,
        style_voice: validData.style_voice,
        signature_items: validData.signature_items,
        primary_goal: validData.primary_goal,
        peak_hours: validData.peak_hours,
        slow_hours: validData.slow_hours,
        default_offer: validData.default_offer,
        avg_ticket_inr: validData.avg_ticket_inr,
        target_monthly_customers: validData.target_monthly_customers,
        phone_whatsapp: validData.phone_whatsapp,
        logo_url: validData.logo_url && validData.logo_url.trim() !== '' ? validData.logo_url.trim() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('business_id', business.id);

    if (updateError) {
      console.error('[Action: updateBusinessProfile] Database error:', updateError);
      return {
        success: false,
        message: 'A database error occurred while saving your profile. Please try again later.'
      };
    }

    // 6. Revalidation
    revalidatePath('/user/business');
    revalidatePath('/user/today');

    return { success: true, message: 'Business profile updated successfully.' };

  } catch (error) {
    console.error('[Action: updateBusinessProfile] Unexpected error:', error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}
