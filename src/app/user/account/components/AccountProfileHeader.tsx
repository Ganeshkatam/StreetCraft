'use client';

import React from 'react';

interface AccountProfileHeaderProps {
  sectionLabel: string;
  displayName: string;
  email: string;
  createdAt: string;
}

export const AccountProfileHeader: React.FC<AccountProfileHeaderProps> = ({
  sectionLabel,
  displayName,
  email,
  createdAt,
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="account-workspace-header">
      <div className="account-workspace-eyebrow">
        {sectionLabel.toUpperCase()}
      </div>

      <div className="account-workspace-title-row">
        <h1 className="account-workspace-title">
          {displayName}
        </h1>
      </div>

      <div className="account-workspace-subtitle">
        {email} &bull; Joined {formattedDate}
      </div>

      <div className="account-workspace-divider" />
    </div>
  );
};
