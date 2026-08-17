import type { Metadata } from 'next';
import { SignupView } from './SignupView';

export const metadata: Metadata = {
  title: 'Create Account — StreetCraft Storefront Engine',
  description: 'Create your free StreetCraft workspace. Turn slow hours, new arrivals, and store moments into walk-in foot traffic.',
  openGraph: {
    title: 'Start Free with StreetCraft',
    description: 'Teach StreetCraft about your store in 60 seconds. Free tier included.',
  },
};

export default function SignupPage() {
  return <SignupView />;
}
