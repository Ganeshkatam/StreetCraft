import React from 'react';

export default function WorkspaceLoading() {
  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px', width: '100%' }}>
      {/* Top Header Skeleton */}
      <div style={{ marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)' }}>
        <div className="skeleton" style={{ width: '140px', height: '14px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '280px', height: '32px', marginBottom: '8px' }} />
        <div className="skeleton" style={{ width: '380px', height: '14px' }} />
      </div>

      {/* Main Content Area Skeleton */}
      <div className="workspace-grid-2col">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="skeleton-card">
            <div className="skeleton" style={{ width: '40%', height: '18px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '60px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ width: '80%', height: '16px' }} />
          </div>
          <div className="skeleton-card">
            <div className="skeleton" style={{ width: '50%', height: '18px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '120px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="skeleton-card">
            <div className="skeleton" style={{ width: '60%', height: '18px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '80px' }} />
          </div>
          <div className="skeleton-card">
            <div className="skeleton" style={{ width: '45%', height: '18px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '90px' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
