import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ businessId: string }>;
}

export default async function BusinessRootPage({ params }: PageProps) {
  const { businessId } = await params;
  redirect(`/user/business/${encodeURIComponent(businessId)}/today`);
}
