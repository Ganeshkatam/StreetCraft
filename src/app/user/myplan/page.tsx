import { redirect } from 'next/navigation';
import { requireAuthenticatedClaims } from '../../../lib/server/auth/requireAuthenticatedClaims';
import { resolveAuthorizedBusiness } from '../../../lib/server/business/resolveAuthorizedBusiness';
import { getAccessibleBusinesses } from '../../../lib/server/business/getAccessibleBusinesses';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MyPlanPageResolver({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const requestedBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const claims = await requireAuthenticatedClaims('/user/myplan');
  const business = await resolveAuthorizedBusiness(claims.userId, requestedBizId);

  if (business) {
    redirect(`/user/business/${encodeURIComponent(business.id)}/plan`);
  }

  const accessible = await getAccessibleBusinesses(claims.userId);
  if (accessible.length > 0) {
    redirect(`/user/business/${encodeURIComponent(accessible[0].id)}/plan`);
  }

  redirect('/user/account/plan');
}
