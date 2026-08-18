'use client';

import React, { useActionState, useEffect } from 'react';
import { updateCampaignStatusAction } from '../../../lib/server/campaigns/updateCampaignStatusAction';
import { getOperatorTransitions } from '../../../lib/domain/campaigns/campaignTransitions';
import { CampaignStatus } from '../../../types/campaign';
import { toast } from 'sonner';

interface CampaignStatusDropdownProps {
  campaignId: string;
  currentStatus: CampaignStatus;
}

export function CampaignStatusDropdown({ campaignId, currentStatus }: CampaignStatusDropdownProps) {
  const [state, action, isPending] = useActionState(updateCampaignStatusAction, null);

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success(`Campaign status updated to ${state.currentStatus}`);
      } else {
        toast.error(state.error);
      }
    }
  }, [state]);

  const operatorTransitions = getOperatorTransitions(currentStatus);
  
  // Always include the current status as the selected (fallback) option visually
  const options = Array.from(new Set([currentStatus, ...operatorTransitions]));

  return (
    <form action={action} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input type="hidden" name="campaignId" value={campaignId} />
      <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>Status:</span>
      <select
        name="requestedStatus"
        className="form-select"
        style={{ 
          fontSize: '12.5px', 
          padding: '6px 12px', 
          width: 'auto',
          opacity: isPending ? 0.6 : 1,
          cursor: isPending ? 'wait' : 'pointer'
        }}
        disabled={isPending || operatorTransitions.length === 0}
        defaultValue={currentStatus}
        onChange={(e) => {
          // Submit the form immediately when the user changes the select
          e.target.form?.requestSubmit();
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt === currentStatus 
              ? `${opt.charAt(0).toUpperCase() + opt.slice(1)} (Current)` 
              : opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </form>
  );
}
