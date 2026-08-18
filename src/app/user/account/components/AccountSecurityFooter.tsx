'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function AccountSecurityFooter() {
  return (
    <footer className="account-footer">
      <div className="account-footer-security-note">
        <ShieldCheck size={16} color="var(--color-primary)" />
        <span>Changes to verified account settings take effect immediately across all active workspaces.</span>
      </div>

      <div className="account-footer-meta">
        <span>SECURITY ENFORCED</span>
        <span>RLS SECURED</span>
      </div>
    </footer>
  );
}
