import { redirect } from 'next/navigation';

export default async function TodayUpgradeRoutePage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  redirect(`/user/business/${encodeURIComponent(businessId)}/today?modal=upgrade`);
}
