'use client';

import React from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AccountSaveIndicatorProps {
  status: SaveStatus;
  errorMessage?: string | null;
}

export const AccountSaveIndicator: React.FC<AccountSaveIndicatorProps> = ({ status, errorMessage }) => {
  if (status === 'idle') return null;

  if (status === 'saving') {
    return (
      <span className="account-save-indicator saving">
        <Loader2 size={12} className="spin" />
        <span>Saving…</span>
      </span>
    );
  }

  if (status === 'saved') {
    return (
      <span className="account-save-indicator saved">
        <Check size={12} />
        <span>Saved</span>
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className="account-save-indicator error" title={errorMessage || 'Failed to save changes'}>
        <AlertCircle size={12} />
        <span>Unable to save</span>
      </span>
    );
  }

  return null;
};
