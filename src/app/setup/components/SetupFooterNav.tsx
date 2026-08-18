'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface SetupFooterNavProps {
  prevHref?: string;
  isSaving?: boolean;
  continueLabel?: string;
  isLastStep?: boolean;
  canProceed?: boolean;
}

export function SetupFooterNav({
  prevHref,
  isSaving = false,
  continueLabel,
  isLastStep = false,
  canProceed = true,
}: SetupFooterNavProps) {
  const defaultLabel = isLastStep ? 'Launch Store' : 'Continue';
  const label = continueLabel || defaultLabel;

  return (
    <div className="setup-footer-nav">
      {prevHref ? (
        <Link href={prevHref} className="btn-secondary setup-footer-back">
          <ChevronLeft size={16} />
          <span>Back</span>
        </Link>
      ) : (
        <div />
      )}

      <button
        type="submit"
        className="btn-primary setup-footer-next"
        disabled={isSaving || !canProceed}
        style={{ cursor: isSaving ? 'wait' : canProceed ? 'pointer' : 'not-allowed' }}
      >
        {isSaving ? (
          <span>Saving...</span>
        ) : (
          <>
            <span>{label}</span>
            {isLastStep ? <Check size={16} /> : <ChevronRight size={16} />}
          </>
        )}
      </button>
    </div>
  );
}
