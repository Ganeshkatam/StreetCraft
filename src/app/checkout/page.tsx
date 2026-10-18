import type { Metadata } from 'next';
import { CheckoutView, CheckoutStoreOption } from './CheckoutView';
import { createClient } from '../../lib/supabase/server';
import { getAccessibleBusinesses } from '../../lib/server/business/getAccessibleBusinesses';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Secure Checkout — StreetCraft Commercial Plan Activation',
  description: 'Upgrade your physical storefront marketing tier. Instant Razorpay checkout for Pro, Founder, and Growth subscriptions.',
};

interface CheckoutPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const resolved = await searchParams;
  const initialPlanId = typeof resolved.plan === 'string' ? resolved.plan : undefined;
  const initialBillingCycle = typeof resolved.cycle === 'string' ? resolved.cycle : undefined;
  const initialBusinessId = typeof resolved.businessId === 'string' ? resolved.businessId : undefined;
  const returnUrl = typeof resolved.returnUrl === 'string' ? resolved.returnUrl : undefined;

  let isAuthenticated = false;
  let userEmail: string | undefined;
  let businesses: CheckoutStoreOption[] = [];

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      isAuthenticated = true;
      userEmail = user.email;
      const accessible = await getAccessibleBusinesses(user.id);
      businesses = accessible.map((b) => ({
        id: b.id,
        name: b.name,
        category: b.category,
      }));
    }
  } catch (err) {
    // Graceful fallback for unauthenticated checkout visitors
    isAuthenticated = false;
  }

  return (
    <CheckoutView
      initialPlanId={initialPlanId}
      initialBillingCycle={initialBillingCycle}
      initialBusinessId={initialBusinessId}
      isAuthenticated={isAuthenticated}
      userEmail={userEmail}
      businesses={businesses}
      returnUrl={returnUrl}
    />
  );
}
