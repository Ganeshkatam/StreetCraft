import React from 'react';
import { WorkspaceNavigation } from './components/WorkspaceNavigation';
import { ServerFooter } from '../components/ServerFooter';

export const dynamic = 'force-dynamic';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <WorkspaceNavigation />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <ServerFooter variant="compact" />
    </div>
  );
}
