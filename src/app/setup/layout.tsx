import React from 'react';

export const dynamic = 'force-dynamic';

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="setup-workspace-wrapper">
      <div className="setup-workspace-container">
        {children}
      </div>
    </div>
  );
}
