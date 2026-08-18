'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, Save } from 'lucide-react';

interface SetupFooterNavProps {
  prevHref?: string;
  nextHref?: string;
  isSaving?: boolean;
  saveButtonText?: string;
  nextLabel?: string;
  showSaveButton?: boolean;
}

export function SetupFooterNav({
  prevHref,
  nextHref,
  isSaving = false,
  saveButtonText = 'Save & Continue',
  nextLabel = 'Continue',
  showSaveButton = true,
}: SetupFooterNavProps) {
  return (
    <div className="setup-footer-nav">
      <div>
        {prevHref ? (
          <Link href={prevHref} className="btn-secondary setup-footer-back">
            <ArrowLeft size={14} />
            <span>Back</span>
          </Link>
        ) : (
          <div />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {showSaveButton && (
          <button
            type="submit"
            className="btn-primary setup-footer-next"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>{saveButtonText}</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        )}

        {!showSaveButton && nextHref && (
          <Link href={nextHref} className="btn-primary setup-footer-next">
            <span>{nextLabel}</span>
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}
