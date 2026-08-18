'use client';

import React from 'react';

interface AccountProfileHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export const AccountProfileHeader: React.FC<AccountProfileHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
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
      </div>

      <div className="account-workspace-subtitle">
        {subtitle}
      </div>

      <div className="account-workspace-divider" />
    </div>
  );
};
