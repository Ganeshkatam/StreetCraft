import { redirect } from 'next/navigation';
import { requireAuthenticatedClaims } from '../../../lib/server/auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../../../lib/server/business/resolveAuthorizedBusiness';
import { getAccessibleBusinesses } from '../../../lib/server/business/getAccessibleBusinesses';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: Promise<{ biz?: string }>;
}

export default async function TodayPageResolver({ searchParams }: PageProps) {
  const params = await searchParams;
  const claims = await requireAuthenticatedClaims('/user/today');

  const business = await resolveAuthorizedBusiness(claims.userId, params?.biz);
  if (!business) {
    const accessible = await getAccessibleBusinesses(claims.userId);
    if (accessible.length === 0) {
      redirect('/setup');
    }
    redirect(`/user/business/${encodeURIComponent(accessible[0].id)}/today`);
  }

  redirect(`/user/business/${encodeURIComponent(business.id)}/today`);
}
