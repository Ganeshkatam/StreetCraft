'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StoreProfileHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  progressPercentage?: number;
  isComplete?: boolean;
}

export const StoreProfileHeader: React.FC<StoreProfileHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  progressPercentage,
  isComplete,
}) => {
  return (
    <div className="account-workspace-header">
      <div className="account-workspace-eyebrow">
        {eyebrow.toUpperCase()}
      </div>

      <div className="account-workspace-title-row">
        <h1 className="account-workspace-title">
          {title}
        </h1>

        {progressPercentage !== undefined && (
          <div>
            {isComplete ? (
              <span className="account-progress-complete-badge">
                <CheckCircle2 size={12} />
                <span>Fully Configured</span>
              </span>
            ) : (
              <span className="header-store-progress-pill">
                <span>{progressPercentage}% Configured</span>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="account-workspace-subtitle">
        {subtitle}
      </div>

      <div className="account-workspace-divider" />
    </div>
  );
};
