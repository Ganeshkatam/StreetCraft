import type { Metadata } from 'next';
import { requireAuthenticatedClaims } from '../../../lib/server/auth/requireAuthenticatedClaims';
import { NewStoreView } from './NewStoreView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Create New Storefront — StreetCraft',
  description: 'Add and configure a new physical storefront in your StreetCraft workspace.',
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewStorePage({ searchParams }: PageProps) {
  await requireAuthenticatedClaims('/new/store');
  const resolvedParams = await searchParams;
  const claimToken = typeof resolvedParams.claim === 'string' ? resolvedParams.claim : undefined;

  return <NewStoreView claimToken={claimToken} />;
}
