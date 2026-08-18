import type { Metadata } from 'next';
import { getAccountStorefronts } from '../../../../lib/server/account/getAccountStorefronts';
import { StorefrontsPanelView } from './StorefrontsPanelView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '02 Storefronts — Account Settings',
  description: 'Manage connected physical stores and switch active store context.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AccountStorefrontsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const candidateBizId = typeof resolvedParams.biz === 'string' ? resolvedParams.biz : undefined;

  const data = await getAccountStorefronts(candidateBizId);

  return <StorefrontsPanelView data={data} />;
}
