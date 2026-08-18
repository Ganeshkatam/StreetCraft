'use client';

import React from 'react';
import { SetupProgress } from './SetupProgress';

interface SetupDomainHeaderProps {
  stepNumber: string;
  stepIndex: number;
  domainName: string;
  title: string;
  subtitle: string;
  businessId: string;
  completionPercentage: number;
}

export function SetupDomainHeader({
  stepNumber,
  stepIndex,
  domainName,
  title,
  subtitle,
  businessId,
  completionPercentage,
}: SetupDomainHeaderProps) {
  return (
    <div className="setup-header-container">
      <SetupProgress
        stepNumber={stepNumber}
        stepIndex={stepIndex}
        domainName={domainName}
        completionPercentage={completionPercentage}
        businessId={businessId}
      />

      <div className="setup-canvas-title-group">
        <h1 className="setup-title">{title}</h1>
        <p className="setup-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
