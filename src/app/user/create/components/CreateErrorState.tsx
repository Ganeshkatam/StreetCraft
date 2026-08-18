'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface CreateErrorStateProps {
  message: string;
  onFixInputs: () => void;
}

export function CreateErrorState({ message, onFixInputs }: CreateErrorStateProps) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1.5px solid var(--color-danger)',
        borderRadius: 'var(--radius-xs)',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-ink)', fontSize: '13.5px' }}>
        <AlertCircle size={18} color="#C53030" style={{ flexShrink: 0 }} />
        <span>{message}</span>
      </div>

      <button
        type="button"
        className="btn-secondary"
        onClick={onFixInputs}
        style={{ fontSize: '12.5px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <RotateCcw size={13} />
        <span>Review Inputs</span>
      </button>
    </div>
  );
}
