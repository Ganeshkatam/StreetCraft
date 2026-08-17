import type { Metadata } from 'next';
import { ResetPasswordView } from './ResetPasswordView';

export const metadata: Metadata = {
  title: 'Set New Password — StreetCraft Recovery',
  description: 'Set a new password for your StreetCraft account.',
};

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
