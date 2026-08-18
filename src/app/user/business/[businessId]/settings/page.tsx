import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function StoreSettingsRootPage({ params }: PageProps) {
  const { businessId } = await params;
  redirect(`/user/business/${encodeURIComponent(businessId)}/settings/identity`);
}
