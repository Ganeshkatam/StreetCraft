import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AccountResolverPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;
  const target = candidateBizId
    ? `/user/account/identity?biz=${encodeURIComponent(candidateBizId)}`
    : '/user/account/identity';

  redirect(target);
}
