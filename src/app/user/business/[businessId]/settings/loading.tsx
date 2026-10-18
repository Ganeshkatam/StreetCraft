import React from 'react';

export default function StoreSettingsLoading() {
  return (
    <div className="account-workspace-container">
      <div className="account-workspace-grid">
        {/* Left Settings Rail Skeleton */}
        <aside style={{ width: '280px', flexShrink: 0 }}>
          <div className="skeleton-card">
            <div className="skeleton" style={{ width: '60%', height: '18px', marginBottom: '16px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ width: '100%', height: '36px', borderRadius: 'var(--radius-xs)' }} />
              ))}
            </div>
          </div>
        </aside>

        {/* Right Settings Stage Skeleton */}
        <main className="account-stage-workspace" role="main" aria-label="Settings Loading">
          <div className="skeleton-card">
            <div className="skeleton" style={{ width: '130px', height: '14px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '260px', height: '28px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '380px', height: '14px', marginBottom: '28px' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div className="skeleton" style={{ width: '100px', height: '14px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '100%', height: '42px', borderRadius: 'var(--radius-xs)' }} />
              </div>
              <div>
                <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: 'var(--radius-xs)' }} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
