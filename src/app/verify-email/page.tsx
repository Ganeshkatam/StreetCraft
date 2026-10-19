import type { Metadata } from 'next';
import VerifyEmailView from './VerifyEmailView';

export const metadata: Metadata = {
  title: 'Verify Your Email · StreetCraft',
  description: 'Confirm your operator email address to activate your StreetCraft marketing workspace.',
  referrer: 'no-referrer',
};

export default function VerifyEmailPage() {
  return <VerifyEmailView />;
}
