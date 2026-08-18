import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { requireAuthenticatedClaims } from '../../../../lib/server/auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../../../../lib/server/business/resolveAuthorizedBusiness';

export const dynamic = 'force-dynamic';

interface StoreWorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function StoreWorkspaceLayout({ children, params }: StoreWorkspaceLayoutProps) {
  const { businessId } = await params;

  if (!businessId || !UUID_REGEX.test(businessId)) {
    notFound();
  }

  const claims = await requireAuthenticatedClaims(`/user/business/${businessId}`);
  const business = await resolveAuthorizedBusiness(claims.userId, businessId);

  if (!business) {
    redirect('/user/account/storefronts');
  }

  return (
    <div className="store-workspace-shell">
      {children}
    </div>
  );
}
