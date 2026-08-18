import React from 'react';
import { notFound } from 'next/navigation';
import { requireAuthenticatedClaims } from '../../../../../lib/server/auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../../../../../lib/server/business/resolveAuthorizedBusiness';
import { getBusinessProfile } from '../../../../../lib/server/business/getBusinessProfile';
import { StoreSettingsRail } from './components/StoreSettingsRail';

export const dynamic = 'force-dynamic';

interface StoreSettingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}

export default async function StoreSettingsLayout({ children, params }: StoreSettingsLayoutProps) {
  const { businessId } = await params;
  const claims = await requireAuthenticatedClaims(`/user/business/${businessId}/settings`);

  const [business, profile] = await Promise.all([
    resolveAuthorizedBusiness(claims.userId, businessId),
    getBusinessProfile(businessId),
  ]);

  if (!business || !profile) {
    notFound();
  }

  return (
    <div className="account-workspace-container">
      <div className="account-workspace-grid">
        <StoreSettingsRail business={business} profile={profile} />
        <main className="account-stage-workspace" role="main" aria-label="Store Settings Stage">
          {children}
        </main>
      </div>
    </div>
  );
}
