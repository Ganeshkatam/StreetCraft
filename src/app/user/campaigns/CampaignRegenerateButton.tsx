'use client';

import React, { useActionState, useEffect } from 'react';
import { regenerateCampaignAction } from '../../../lib/server/campaigns/regenerateCampaignAction';
import { CampaignStatus } from '../../../types/campaign';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface CampaignRegenerateButtonProps {
  campaignId: string;
  generationRevision: number;
  status: CampaignStatus;
}

export function CampaignRegenerateButton({
  campaignId,
  generationRevision,
  status,
}: CampaignRegenerateButtonProps) {
  const [state, formAction, isPending] = useActionState(regenerateCampaignAction, null);

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success(state.message || 'Campaign regenerated successfully.');
      } else {
        toast.error(state.message || 'Failed to regenerate campaign.');
      }
    }
  }, [state]);

  const upperStatus = (status || '').toUpperCase();
  const isRegenerable = upperStatus === 'READY' || upperStatus === 'FAILED';

  if (!isRegenerable) {
    return null;
  }

  return (
    <form action={formAction} style={{ display: 'inline-block' }}>
      <input type="hidden" name="campaignId" value={campaignId} />
      <input type="hidden" name="expectedGenerationRevision" value={generationRevision} />
      <button
        type="submit"
        className="btn-secondary"
        style={{
          fontSize: '12.5px',
          padding: '6px 14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          cursor: isPending ? 'wait' : 'pointer',
          opacity: isPending ? 0.7 : 1,
        }}
        disabled={isPending}
        title="Regenerate all 4 channel proofs using store profile (consumes 1 generation quota)"
      >
        <RefreshCw size={13} className={isPending ? 'animate-spin' : ''} />
        {isPending ? 'Regenerating Proofs...' : 'Regenerate Campaign'}
      </button>
    </form>
  );
}
