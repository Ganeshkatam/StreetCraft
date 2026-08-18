'use client';

import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { AccountViewModel } from '../../../lib/server/account/getAccountProfile';
import { AccountRail, AccountTabId } from './components/AccountRail';
import { AccountProfileHeader } from './components/AccountProfileHeader';
import { IdentityPanel } from './identity/IdentityPanel';
import { StorefrontsPanel } from './storefronts/StorefrontsPanel';
import { NotificationsPanel } from './notifications/NotificationsPanel';
import { SecurityPanel } from './security/SecurityPanel';
import { PlanUsagePanel } from './plan/PlanUsagePanel';

interface AccountSettingsViewProps {
  accountData: AccountViewModel;
}

export const AccountSettingsView: React.FC<AccountSettingsViewProps> = ({ accountData }) => {
  const [activeTab, setActiveTab] = useState<AccountTabId>('identity');

  const { profile, businesses, entitlement, profileInitialized } = accountData;

  if (!profileInitialized || !profile) {
    return (
      <div className="account-uninitialized-box">
        <div className="account-uninitialized-card">
          <h2>Profile Uninitialized</h2>
          <p>
            Your account authentication claims exist, but your profile has not yet been initialized.
          </p>
          <form action="/auth/signout" method="POST">
            <button type="submit" className="btn-primary">
              Sign Out and Re-authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(profile.createdAt).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });

  const tabHeaders: Record<AccountTabId, { eyebrow: string; title: string; subtitle: string }> = {
    identity: {
      eyebrow: 'YOUR PROFILE',
      title: profile.fullName || 'Your Profile',
      subtitle: `${profile.email} • Joined ${formattedDate}`,
    },
    stores: {
      eyebrow: 'STOREFRONTS',
      title: 'Connected Storefronts',
      subtitle: 'Manage your connected physical businesses and storefront profiles',
    },
    notifications: {
      eyebrow: 'PREFERENCES',
      title: 'Notification Preferences',
      subtitle: 'Configure alerts for customer bookings, campaign launches, and weekly digests',
    },
    security: {
      eyebrow: 'ACCOUNT & SECURITY',
      title: 'Password & Security',
      subtitle: 'Manage your password, login authorization codes, and verified credentials',
    },
    plan: {
      eyebrow: 'SUBSCRIPTION',
      title: 'Plan & Usage Limits',
      subtitle: 'View your workspace tier, quotas, and active storefront allowances',
    },
  };

  const currentHeader = tabHeaders[activeTab];

  return (
    <div className="account-workspace-container">
      <div className="account-workspace-grid">
        {/* Left Navigation Rail */}
        <AccountRail
          profile={profile}
          businesses={businesses}
          entitlement={entitlement}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
        />

        {/* Right Stage (Active Control Surface) */}
        <main className="account-stage-workspace" role="main" aria-label="Account Settings Stage">
          {/* Contextual Tab Header */}
          <AccountProfileHeader
            eyebrow={currentHeader.eyebrow}
            title={currentHeader.title}
            subtitle={currentHeader.subtitle}
          />

          <div className="account-stage-content" key={activeTab}>
            {activeTab === 'identity' && (
              <IdentityPanel profile={profile} />
            )}

            {activeTab === 'stores' && (
              <StorefrontsPanel businesses={businesses} entitlement={entitlement} />
            )}

            {activeTab === 'notifications' && (
              <NotificationsPanel profile={profile} />
            )}

            {activeTab === 'security' && (
              <SecurityPanel profile={profile} />
            )}

            {activeTab === 'plan' && (
              <PlanUsagePanel entitlement={entitlement} businesses={businesses} />
            )}
          </div>

          {/* Fixed Workspace Footer */}
          <div className="account-workspace-footer">
            <div className="account-footer-security-note">
              <ShieldCheck size={16} />
              <span>Your account is protected with StreetCraft security</span>
            </div>

            <div className="account-footer-meta">
              <span>STREETCRAFT &bull; {new Date().getFullYear()}</span>
              <span>All rights reserved.</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
