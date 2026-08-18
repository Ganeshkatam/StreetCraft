import { redirect } from 'next/navigation';
import { requireAuthenticatedClaims } from '../../../lib/server/auth/requireAuthenticatedClaims';
import { getAccessibleBusinesses } from '../../../lib/server/business/getAccessibleBusinesses';

export const dynamic = 'force-dynamic';

export default async function BusinessResolverPage() {
  const claims = await requireAuthenticatedClaims('/user/business');
  const businesses = await getAccessibleBusinesses(claims.userId);

  if (businesses.length === 0) {
    redirect('/setup');
  }

  redirect(`/user/business/${encodeURIComponent(businesses[0].id)}/today`);
}
