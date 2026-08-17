import type { Metadata } from 'next';
import { TodayView } from './TodayView';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Today Dashboard — StreetCraft Workspace',
  description: 'Daily briefing, store opportunity radar, and active campaigns for your store.',
};

export default function TodayPage() {
  return <TodayView />;
}
