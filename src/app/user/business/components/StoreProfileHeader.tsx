'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface StoreProfileHeaderProps {
  sectionLabel: string;
  storeName: string;
  category: string;
  city: string;
  progressPercentage?: number;
  isComplete?: boolean;
}

export const StoreProfileHeader: React.FC<StoreProfileHeaderProps> = ({
  sectionLabel,
  storeName,
  category,
  city,
  progressPercentage,
  isComplete,
}) => {
  return (
    <div className="account-workspace-header">
      <div className="account-workspace-eyebrow">
        {sectionLabel.toUpperCase()}
      </div>

      <div className="account-workspace-title-row">
        <h1 className="account-workspace-title">
          {storeName}
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
        {category || 'Storefront'} {city ? `\u2022 ${city}` : ''}
      </div>

      <div className="account-workspace-divider" />
    </div>
  );
};
