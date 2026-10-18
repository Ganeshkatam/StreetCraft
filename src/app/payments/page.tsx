import type { Metadata } from 'next';
import { PaymentsView } from './PaymentsView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Payments & Subscriptions — StreetCraft Commercial Rails',
  description: 'Commercial payments portal for StreetCraft subscriptions. Supported payment rails, GST invoices, flat rates, and instant plan upgrades.',
};

export default function PaymentsPage() {
  return <PaymentsView />;
}
