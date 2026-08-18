'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { updateCampaignNotesAction } from '../../../lib/server/campaigns/updateCampaignNotesAction';
import { toast } from 'sonner';

interface CampaignNotesEditorProps {
  campaignId: string;
  initialNotes: string;
}

export function CampaignNotesEditor({ campaignId, initialNotes }: CampaignNotesEditorProps) {
  const [state, action, isPending] = useActionState(updateCampaignNotesAction, null);
  const [localNotes, setLocalNotes] = useState(initialNotes);

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success('Campaign notes saved successfully');
        setLocalNotes(state.notes || '');
      } else {
        toast.error(state.error);
        // Do not revert localNotes on error so the user doesn't lose their typing.
      }
    }
  }, [state]);

  const characterCount = Array.from(localNotes.trim()).length;
  const isOverLimit = characterCount > 2000;

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>
          Operator Notes
        </h3>
        <span 
          style={{ 
            fontSize: '12px', 
            fontFamily: 'var(--font-mono)', 
            color: isOverLimit ? 'var(--color-danger)' : 'var(--color-ink-muted)'
          }}
        >
          {characterCount} / 2000
        </span>
      </div>

      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="hidden" name="campaignId" value={campaignId} />
        
        <textarea
          name="notes"
          value={localNotes}
          onChange={(e) => setLocalNotes(e.target.value)}
          disabled={isPending}
          placeholder="No walk-in notes recorded yet..."
          style={{
            width: '100%',
            minHeight: '120px',
            padding: '12px 16px',
            background: 'var(--color-surface-raised)',
            border: `1px solid ${isOverLimit ? 'var(--color-danger)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-xs)',
            fontSize: '13px',
            color: 'var(--color-ink)',
            lineHeight: '1.5',
            resize: 'vertical',
            fontFamily: 'inherit',
            opacity: isPending ? 0.6 : 1,
          }}
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn-primary"
            style={{ fontSize: '13px', padding: '6px 16px' }}
            disabled={isPending || isOverLimit}
          >
            {isPending ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </form>
    </div>
  );
}
