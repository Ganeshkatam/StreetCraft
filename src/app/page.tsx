import React from 'react';
import Link from 'next/link';
import { Logo } from '../components/Logo';
import { ServerFooter } from './components/ServerFooter';
import { LandingView } from './LandingView';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'StreetCraft — A Growth Engine for Physical Businesses',
  description:
    'Turn one business opportunity into everything customers need to see across Google, Instagram, WhatsApp, and in-store counter print.',
};

export default function HomePage() {
  return (
    <>
      {/* Public Editorial Header */}
      <header className="main-header">
        <div className="header-container">
          <Link href="/" className="brand-wrapper">
            <Logo size="md" />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <Link href="/how-it-works" className="btn-ghost" style={{ fontSize: '13.5px' }}>
              How It Works
            </Link>
            <Link href="/pricing" className="btn-ghost" style={{ fontSize: '13.5px' }}>
              Pricing
            </Link>
            <Link href="/login" className="btn-primary" style={{ padding: '8px 18px', fontSize: '13.5px' }}>
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Complete Full-Fidelity Editorial Landing Page */}
      <main style={{ flex: 1 }}>
        <LandingView />
      </main>

      {/* Full Contextual Editorial Footer */}
      <ServerFooter variant="full" />
    </>
  );
}
