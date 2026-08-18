import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LegacyCustomersPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const biz = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;
  if (biz) {
    redirect(`/setup/${encodeURIComponent(biz)}/customers`);
  }
  redirect('/setup');
}
