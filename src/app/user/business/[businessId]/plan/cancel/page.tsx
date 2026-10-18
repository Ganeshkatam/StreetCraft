import { redirect } from 'next/navigation';

export default async function PlanCancelRoutePage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  redirect(`/user/business/${encodeURIComponent(businessId)}/plan?modal=cancel-plan`);
}
