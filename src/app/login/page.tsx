import type { Metadata } from 'next';
import { LoginView } from './LoginView';

export const metadata: Metadata = {
  title: 'Sign In — StreetCraft Workspace',
  description: 'Sign in to your StreetCraft store workspace to access daily opportunities, campaign proofs, and store marketing.',
  openGraph: {
    title: 'Sign In to StreetCraft',
    description: 'Access your physical store workspace and campaign vault.',
  },
};

export default function LoginPage() {
  return <LoginView />;
}
