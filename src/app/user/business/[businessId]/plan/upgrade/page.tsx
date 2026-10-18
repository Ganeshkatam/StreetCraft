import { redirect } from 'next/navigation';

export default async function PlanUpgradeRoutePage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  redirect(`/user/business/${encodeURIComponent(businessId)}/plan?modal=upgrade`);
}
