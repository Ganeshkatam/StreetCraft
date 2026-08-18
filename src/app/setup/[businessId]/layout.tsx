import React from 'react';
import { notFound } from 'next/navigation';
import { requireAuthenticatedClaims } from '../../../lib/server/auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../../../lib/server/business/resolveAuthorizedBusiness';

export const dynamic = 'force-dynamic';

interface SetupLayoutProps {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}

export default async function SetupStorefrontLayout({
  children,
  params,
}: SetupLayoutProps) {
  const { businessId } = await params;

  // 1. UUID format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!businessId || !uuidRegex.test(businessId)) {
    notFound();
  }

  // 2. Authentication & tenant membership authorization
  const claims = await requireAuthenticatedClaims('/setup');
  const business = await resolveAuthorizedBusiness(claims.userId, businessId);

  if (!business) {
    notFound();
  }

  return <>{children}</>;
}
