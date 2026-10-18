import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckoutView, CheckoutStoreOption } from '../../../../checkout/CheckoutView';
import { requireAuthenticatedClaims } from '../../../../../lib/server/auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../../../../../lib/server/business/resolveAuthorizedBusiness';
import { getAccessibleBusinesses } from '../../../../../lib/server/business/getAccessibleBusinesses';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Store Plan Checkout — StreetCraft',
  description: 'Upgrade storefront campaign quota and commercial allowances with instant Razorpay checkout.',
};

interface PageProps {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StoreCheckoutPage({ params, searchParams }: PageProps) {
  const { businessId } = await params;
  const resolvedQuery = await searchParams;

  const claims = await requireAuthenticatedClaims(`/user/business/${businessId}/checkout`);
  const [business, accessible] = await Promise.all([
    resolveAuthorizedBusiness(claims.userId, businessId),
    getAccessibleBusinesses(claims.userId),
  ]);

  if (!business) {
    notFound();
  }

  const initialPlanId = typeof resolvedQuery.plan === 'string' ? resolvedQuery.plan : 'PRO';
  const initialBillingCycle = typeof resolvedQuery.cycle === 'string' ? resolvedQuery.cycle : 'monthly';

  const businesses: CheckoutStoreOption[] = accessible.map((b) => ({
    id: b.id,
    name: b.name,
    category: b.category,
  }));

  return (
    <CheckoutView
      initialPlanId={initialPlanId}
      initialBillingCycle={initialBillingCycle}
      initialBusinessId={business.id}
      isAuthenticated={true}
      userEmail={claims.email}
      businesses={businesses}
      returnUrl={`/user/business/${encodeURIComponent(business.id)}/plan`}
    />
  );
}
