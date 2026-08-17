import type { Metadata } from 'next';
import { SetupView } from './SetupView';

export const metadata: Metadata = {
  title: 'Store Setup & Onboarding — StreetCraft',
  description: 'Initialize your store profile, operating rhythm, and signature items to customize your StreetCraft workspace.',
};

export default function SetupPage() {
  return <SetupView />;
}
