import type { Metadata } from 'next';
import { ForgotPasswordView } from './ForgotPasswordView';

export const metadata: Metadata = {
  title: 'Reset Password — StreetCraft Workspace Recovery',
  description: 'Recover access to your StreetCraft storefront account and campaign vault.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordView />;
}
