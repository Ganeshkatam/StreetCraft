'use client';

import React from 'react';

interface CreateStepIndicatorProps {
  currentStep: number;
  onSelectStep?: (step: number) => void;
  maxAccessibleStep: number;
}

export function CreateStepIndicator({ currentStep, onSelectStep, maxAccessibleStep }: CreateStepIndicatorProps) {
  const steps = [
    { num: 1, title: '01 Store Moment' },
    { num: 2, title: '02 Primary Goal' },
    { num: 3, title: '03 The Offer & Timing' },
    { num: 4, title: '04 Coordinated Proofs' },
  ];

  return (
    <nav className="create-step-indicator" style={{ display: 'flex', gap: '12px', marginBottom: '28px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px', flexWrap: 'wrap' }} aria-label="Campaign Creation Steps">
      {steps.map((s) => {
        const isActive = currentStep === s.num;
        const isPast = currentStep > s.num;
        const isClickable = s.num <= maxAccessibleStep && onSelectStep && !isActive;

        return (
          <button
            key={s.num}
            type="button"
            disabled={!isClickable}
            onClick={() => isClickable && onSelectStep(s.num)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12.5px',
              fontWeight: isActive ? 700 : isPast ? 600 : 400,
              color: isActive ? 'var(--color-primary)' : isPast ? 'var(--color-ink)' : 'var(--color-ink-muted)',
              background: isActive ? 'var(--color-primary-subtle)' : isPast ? 'var(--color-surface-raised)' : 'transparent',
              padding: '6px 14px',
              borderRadius: 'var(--radius-xs)',
              border: isActive ? '1px solid var(--color-primary-border)' : '1px solid var(--color-border)',
              cursor: isClickable ? 'pointer' : 'default',
              transition: 'var(--motion-fast)',
            }}
          >
            {s.title}
          </button>
        );
      })}
    </nav>
  );
}
