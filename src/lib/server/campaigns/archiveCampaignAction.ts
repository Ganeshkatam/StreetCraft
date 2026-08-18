'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAuthenticatedClaims } from '../auth/requireAuthenticatedClaims';
import { createClient } from '../../supabase/server';

const ArchiveCampaignSchema = z.object({
  campaignId: z.string().uuid('Invalid campaign ID format.'),
});

export type ArchiveCampaignActionState = {
  success: boolean;
  message: string;
  data?: any;
};

export async function archiveCampaignAction(
  prevState: ArchiveCampaignActionState | null,
  formData: FormData
): Promise<ArchiveCampaignActionState> {
  try {
    const rawCampaignId = formData.get('campaignId');

    const parsed = ArchiveCampaignSchema.safeParse({
      campaignId: rawCampaignId,
    });

    if (!parsed.success) {
      return {
        success: false,
        message: 'Invalid input. ' + parsed.error.issues[0].message,
      };
    }

    const { campaignId } = parsed.data;

    // 1. Authenticate caller
    await requireAuthenticatedClaims('/user/campaigns');
    const supabase = await createClient();

    // 2. Call the Transactional RPC to transition status to 'archived'
    // The RPC enforces SECURITY INVOKER, owner/admin role verification, FOR UPDATE locking, and state transition logic.
    const { data: rpcResult, error: rpcError } = await supabase.rpc('transition_campaign_status', {
      p_campaign_id: campaignId,
      p_requested_status: 'archived',
    });

    if (rpcError) {
      if (rpcError.message.includes('ILLEGAL_STATE_TRANSITION')) {
        return { success: false, message: 'Cannot archive this campaign. It may already be archived.' };
      }
      if (rpcError.message.includes('UNAUTHORIZED_OPERATOR')) {
        return { success: false, message: 'Unauthorized. Only business owners and admins can archive campaigns.' };
      }
      if (rpcError.code === 'P0002' || rpcError.message.includes('not found')) {
        return { success: false, message: 'Campaign not found.' };
      }
      return { success: false, message: 'Failed to archive campaign: ' + rpcError.message };
    }

    // 3. Revalidate affected surfaces
    revalidatePath('/user/campaigns');
    revalidatePath(`/user/campaigns/${campaignId}`);
    revalidatePath('/user/today');

    return {
      success: true,
      message: 'Campaign archived successfully.',
      data: rpcResult,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'REDIRECT_TO_LOGIN') throw err;
    console.error('archiveCampaignAction error:', err);
    return {
      success: false,
      message: 'Authentication failed or an unexpected error occurred.',
    };
  }
}
