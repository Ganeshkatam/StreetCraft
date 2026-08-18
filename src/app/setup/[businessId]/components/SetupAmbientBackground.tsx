'use client';

import React from 'react';
import { DomainKey } from '../../../../lib/domain/setup/setupTypes';

interface SetupAmbientBackgroundProps {
  domain: DomainKey;
  children: React.ReactNode;
}

export function SetupAmbientBackground({
  domain,
  children,
}: SetupAmbientBackgroundProps) {
  return (
    <div className={`setup-workspace-wrapper setup-bg-${domain}`}>
      <div className="setup-backdrop-overlay" />
      <div className="setup-workspace-container" style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
}
