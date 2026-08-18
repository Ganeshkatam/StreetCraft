'use client';

import React from 'react';
import { Lock } from 'lucide-react';

interface AuthIdentityFieldProps {
  label: string;
  email: string;
}

export const AuthIdentityField: React.FC<AuthIdentityFieldProps> = ({ label, email }) => {
  return (
    <div className="account-field-row">
      <div className="account-field-meta-label">
        {label.toUpperCase()}
      </div>

      <div className="account-field-content-row">
        <div className="account-field-display-value">
          {email}
        </div>

        <div className="account-auth-identity-pill" title="Authentication identity is managed by Supabase Auth">
          <Lock size={12} />
          <span>Auth Identity</span>
        </div>
      </div>

      <div className="account-field-row-divider" />
    </div>
  );
};
