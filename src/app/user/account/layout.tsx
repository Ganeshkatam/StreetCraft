import React from 'react';
import { getAccountProfile } from '../../../lib/server/account/getAccountProfile';
import { AccountRail } from './components/AccountRail';

export const dynamic = 'force-dynamic';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const profile = await getAccountProfile();

  return (
    <div className="account-workspace-container">
      <div className="account-workspace-grid">
        {/* Left Navigation Rail */}
        <AccountRail
          fullName={profile.fullName}
          email={profile.email}
          avatarUrl={profile.avatarUrl}
        />

        {/* Right Stage (Active Control Surface) */}
        <main className="account-stage-workspace" role="main" aria-label="Account Settings Stage">
          {children}
        </main>
      </div>
    </div>
  );
}
