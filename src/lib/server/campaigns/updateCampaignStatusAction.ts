'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { getAccessibleBusinesses } from '../business/getAccessibleBusinesses';
import { createClient } from '../../supabase/server';

const UpdateStatusSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID format.'),
  requestedStatus: z.string().min(1),
});

export type UpdateCampaignStatusResult =
  | { success: true; previousStatus: string; currentStatus: string; updatedAt: string }
  | { success: false; error: string; code?: string };

export async function updateCampaignStatusAction(
  _prevState: any,
  formData: FormData
): Promise<UpdateCampaignStatusResult> {
  try {
    const rawCampaignId = formData.get('campaignId');
    const rawStatus = formData.get('requestedStatus');

    const parsed = UpdateStatusSchema.safeParse({
      campaignId: rawCampaignId,
      requestedStatus: rawStatus,
    });

    if (!parsed.success) {
      return { success: false, error: 'Invalid input. ' + parsed.error.issues[0].message };
    }

    const { campaignId, requestedStatus } = parsed.data;

    // 1. Authenticate
    const claims = await requireAuthenticatedClaims();
    const supabase = await createClient();

    // 2. Defense in Depth: Pre-authorization
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('business_id')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return { success: false, error: 'Campaign not found.' };
    }

    const accessibleBusinesses = await getAccessibleBusinesses(claims.userId);
    const membership = accessibleBusinesses.find(b => b.id === campaign.business_id);

    if (!membership) {
      return { success: false, error: 'Unauthorized. You do not have access to this campaign.' };
    }

    if (membership.role !== 'owner' && membership.role !== 'admin') {
      return { success: false, error: 'Unauthorized. Only owners and admins can update campaign status.' };
    }

    // 3. Call the Transactional RPC
    const { data: result, error: rpcError } = await supabase.rpc('transition_campaign_status', {
      p_campaign_id: campaignId,
      p_requested_status: requestedStatus,
    });

    if (rpcError) {
      console.error('RPC transition error:', rpcError);

      if (rpcError.message.includes('ILLEGAL_STATE_TRANSITION')) {
        return { success: false, error: 'Invalid status transition requested.' };
      }

      return { success: false, error: 'Failed to update campaign status: ' + rpcError.message };
    }

    // 4. Revalidate cache
    revalidatePath('/user/campaigns');
    revalidatePath('/user/campaigns/[id]', 'page');

    return {
      success: true,
      previousStatus: result.previous_status,
      currentStatus: result.current_status,
      updatedAt: result.updated_at,
    };
  } catch (err: unknown) {
    console.error('updateCampaignStatusAction error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
