'use client';

import React from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface SetupDomainHeaderProps {
  stepNumber: string;
  domainName: string;
  title: string;
  subtitle: string;
  businessId?: string;
  totalSteps?: number;
}

export function SetupDomainHeader({
  stepNumber,
  domainName,
  title,
  subtitle,
  businessId,
  totalSteps = 9,
}: SetupDomainHeaderProps) {
  const exitHref = businessId ? `/user/today?biz=${encodeURIComponent(businessId)}` : '/user/today';
  const currentStepInt = parseInt(stepNumber, 10) || 1;
  const progressPercent = Math.min(100, Math.round((currentStepInt / totalSteps) * 100));

  return (
    <div className="setup-header-container">
      {/* Top Progress Bar Row */}
      <div className="setup-progress-wrapper">
        <div className="setup-progress-meta">
          <div className="setup-progress-step-tag">
            <span>STEP {currentStepInt} OF {totalSteps}</span>
            <span className="setup-progress-bullet">&bull;</span>
            <span className="setup-progress-domain">{domainName.toUpperCase()}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="setup-progress-percent">{progressPercent}% COMPLETE</span>
            <Link
              href={exitHref}
              className="setup-exit-pill"
              title="Exit to Today Workspace"
            >
              <X size={13} />
              <span>Exit</span>
            </Link>
          </div>
        </div>

        {/* The Animated Progress Track */}
        <div className="setup-progress-track">
          <div
            className="setup-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="setup-canvas-title-group">
        <h1 className="setup-title">{title}</h1>
        <p className="setup-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
