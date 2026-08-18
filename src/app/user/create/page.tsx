import { redirect } from 'next/navigation';
import { requireAuthenticatedClaims } from '../../../lib/server/auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../../../lib/server/business/resolveAuthorizedBusiness';
import { getAccessibleBusinesses } from '../../../lib/server/business/getAccessibleBusinesses';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CreateCampaignPageResolver({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const requestedBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const claims = await requireAuthenticatedClaims('/user/create');
  let business = await resolveAuthorizedBusiness(claims.userId, requestedBizId);

  if (!business) {
    const accessible = await getAccessibleBusinesses(claims.userId);
    if (accessible.length === 0) {
      redirect('/setup');
    }
    business = accessible[0];
  }

  const queryParams = new URLSearchParams();
  for (const [k, v] of Object.entries(resolvedParams)) {
    if (k !== 'biz' && typeof v === 'string') {
      queryParams.set(k, v);
    }
  }

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  redirect(`/user/business/${encodeURIComponent(business.id)}/create${queryString}`);
}
