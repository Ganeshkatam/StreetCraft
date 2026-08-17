import React from 'react';
import { PublicHeader } from './components/PublicHeader';
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
      <PublicHeader />

      {/* Complete Full-Fidelity Editorial Landing Page */}
      <main style={{ flex: 1 }}>
        <LandingView />
      </main>

      {/* Full Contextual Editorial Footer */}
      <ServerFooter variant="full" />
    </>
  );
}
