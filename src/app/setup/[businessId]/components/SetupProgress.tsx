'use client';

import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface SetupProgressProps {
  stepNumber: string; // "01" .. "09"
  stepIndex: number; // 1 .. 9
  domainName: string;
  completionPercentage: number;
  businessId: string;
  totalSteps?: number;
}

export function SetupProgress({
  stepNumber,
  stepIndex,
  domainName,
  completionPercentage,
  businessId,
  totalSteps = 9,
}: SetupProgressProps) {
  const exitHref = `/user/business/${encodeURIComponent(businessId)}/today`;
  const positionalPercent = Math.min(100, Math.round((stepIndex / totalSteps) * 100));

  return (
    <div className="setup-progress-wrapper">
      <div className="setup-progress-meta">
        <div className="setup-progress-step-tag">
          <span>STEP {stepNumber} OF 0{totalSteps}</span>
          <span className="setup-progress-bullet">&bull;</span>
          <span className="setup-progress-domain">{domainName.toUpperCase()}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="setup-progress-percent">{completionPercentage}% CONFIGURED</span>
          <Link
            href={exitHref}
            className="setup-exit-pill"
            title="Exit to Store Workspace"
          >
            <X size={13} />
            <span>Exit</span>
          </Link>
        </div>
      </div>

      <div className="setup-progress-track">
        <div
          className="setup-progress-fill"
          style={{ width: `${positionalPercent}%` }}
        />
      </div>
    </div>
  );
}
