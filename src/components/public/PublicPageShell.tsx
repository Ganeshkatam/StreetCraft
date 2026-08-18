import React from 'react';
import { PublicHeader } from '../../app/components/PublicHeader';
import { ServerFooter } from '../../app/components/ServerFooter';

interface PublicPageShellProps {
  children: React.ReactNode;
}

export function PublicPageShell({ children }: PublicPageShellProps) {
  return (
    <div className="landing-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />
      <main style={{ maxWidth: '1240px', width: '100%', margin: '0 auto', padding: '0 var(--space-gutter) 100px', flex: 1 }}>
        {children}
      </main>
      <ServerFooter variant="full" />
    </div>
  );
}
