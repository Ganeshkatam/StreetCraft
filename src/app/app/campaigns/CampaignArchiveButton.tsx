'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { archiveCampaignAction } from '../../../lib/server/campaigns/archiveCampaignAction';
import { CampaignStatus } from '../../../types/campaign';
import { Archive, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CampaignArchiveButtonProps {
  campaignId: string;
  currentStatus: CampaignStatus;
}

export function CampaignArchiveButton({
  campaignId,
  currentStatus,
}: CampaignArchiveButtonProps) {
  const [state, formAction, isPending] = useActionState(archiveCampaignAction, null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success(state.message || 'Campaign archived successfully.');
        setIsConfirming(false);
      } else {
        toast.error(state.message || 'Failed to archive campaign.');
      }
    }
  }, [state]);

  const upperStatus = (currentStatus || '').toUpperCase();
  if (upperStatus === 'ARCHIVED') {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="btn-ghost"
        style={{
          fontSize: '12.5px',
          padding: '6px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--color-danger)',
          border: '1px solid var(--color-danger-subtle)',
          borderRadius: 'var(--radius-xs)',
          cursor: 'pointer',
        }}
        onClick={() => setIsConfirming(true)}
        title="Retire this campaign to historical archives"
      >
        <Archive size={13} />
        Archive
      </button>

      {isConfirming && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '28px',
              boxShadow: 'var(--shadow-elevation-high)',
              background: 'var(--color-surface)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
              <div
                style={{
                  background: 'var(--color-danger-subtle)',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  Archive Campaign?
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>
                  Archived campaigns cannot be published, regenerated, or edited. The campaign will be preserved as a read-only historical record.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '7px 16px' }}
                onClick={() => setIsConfirming(false)}
                disabled={isPending}
              >
                Cancel
              </button>

              <form action={formAction}>
                <input type="hidden" name="campaignId" value={campaignId} />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    fontSize: '13px',
                    padding: '7px 16px',
                    background: 'var(--color-danger)',
                    borderColor: 'var(--color-danger)',
                    cursor: isPending ? 'wait' : 'pointer',
                    opacity: isPending ? 0.7 : 1,
                  }}
                  disabled={isPending}
                >
                  {isPending ? 'Archiving...' : 'Confirm Archive'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
