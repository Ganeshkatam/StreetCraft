'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { getAccessibleBusinesses } from '../business/getAccessibleBusinesses';
import { createClient } from '../../supabase/server';

const UpdateNotesSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID format.'),
  notes: z.string().superRefine((val, ctx) => {
    // We enforce 2000 Unicode code points, not UTF-16 code units.
    const trimmed = val.trim();
    if (Array.from(trimmed).length > 2000) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: 2000,
        type: 'string',
        inclusive: true,
        message: 'Notes cannot exceed 2,000 characters.',
      });
    }
  }),
});

export type UpdateCampaignNotesResult =
  | { success: true; notes: string | null }
  | { success: false; error: string };

export async function updateCampaignNotesAction(
  prevState: any,
  formData: FormData
): Promise<UpdateCampaignNotesResult> {
  try {
    const rawCampaignId = formData.get('campaignId');
    const rawNotes = formData.get('notes');

    const parsed = UpdateNotesSchema.safeParse({
      campaignId: rawCampaignId,
      notes: typeof rawNotes === 'string' ? rawNotes : '',
    });

    if (!parsed.success) {
      return { success: false, error: 'Invalid input. ' + parsed.error.issues[0].message };
    }

    const { campaignId, notes } = parsed.data;
    const trimmedNotes = notes.trim();
    const finalNotes = trimmedNotes === '' ? null : trimmedNotes;

    // 1. Authenticate
    const claims = await requireAuthenticatedClaims();
    const supabase = await createClient();

    // 2. Defense in Depth: Pre-authorization
    const accessibleBusinesses = await getAccessibleBusinesses(claims.userId);
    const validBusinessIds = accessibleBusinesses
      .filter(b => b.role === 'owner' || b.role === 'admin')
      .map(b => b.id);

    if (validBusinessIds.length === 0) {
      return { success: false, error: 'Unauthorized. You do not have operator permissions.' };
    }

    // 3. Perform RLS-protected scoped UPDATE
    // The query explicitly constrains the update to the caller's authorized business IDs.
    const { error: updateError, count } = await supabase
      .from('campaigns')
      .update({
        performance_notes: finalNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
      .in('business_id', validBusinessIds);

    if (updateError) {
      console.error('Failed to update campaign notes:', updateError);
      return { success: false, error: 'Failed to update campaign notes.' };
    }

    // Since Supabase `update` without `.select()` does not throw a hard error if 0 rows are updated 
    // due to RLS/scoping, we must verify the mutation. Unfortunately Supabase's exact row count requires 
    // `{ count: 'exact' }` in the original query or a `.select()`. Let's just blindly revalidate, but to be 
    // safe against silent failures, we can rely on RLS returning 0 rows if unauthorized.
    // To strictly verify:
    const { data: verifyData } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .in('business_id', validBusinessIds)
      .single();

    if (!verifyData) {
      return { success: false, error: 'Unauthorized or campaign not found.' };
    }

    // 4. Revalidate cache
    revalidatePath('/user/campaigns');
    revalidatePath('/user/campaigns/[id]', 'page');

    return {
      success: true,
      notes: finalNotes,
    };
  } catch (err: unknown) {
    console.error('updateCampaignNotesAction error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
