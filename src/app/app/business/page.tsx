import type { Metadata } from 'next';
import { BusinessView } from './BusinessView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Store Profile & Context — StreetCraft Workspace',
  description: 'Manage store identity, neighborhood landmarks, specialties, and operating rhythm.',
};

export default function BusinessPage() {
  return <BusinessView />;
}
