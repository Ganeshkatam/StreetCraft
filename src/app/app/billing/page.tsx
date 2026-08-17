import type { Metadata } from 'next';
import { BillingSettingsView } from './BillingSettingsView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Billing & Usage — StreetCraft Workspace',
  description: 'Manage subscription plan, monthly campaign quota, and workspace billing history.',
};

export default function BillingSettingsPage() {
  return <BillingSettingsView />;
}
