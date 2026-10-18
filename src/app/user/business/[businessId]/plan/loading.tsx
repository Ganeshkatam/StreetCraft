import React from 'react';

export default function PlanLoading() {
  return (
    <div style={{ width: '100%', padding: '24px var(--space-gutter) 80px' }}>
      {/* Top Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="skeleton" style={{ width: '110px', height: '13px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '220px', height: '34px' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="skeleton" style={{ width: '130px', height: '36px', borderRadius: 'var(--radius-xs)' }} />
          <div className="skeleton" style={{ width: '120px', height: '36px', borderRadius: 'var(--radius-xs)' }} />
        </div>
      </div>

      {/* Main Plan Overview Card Skeleton */}
      <div className="skeleton-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="skeleton" style={{ width: '100px', height: '12px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '240px', height: '30px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '200px', height: '14px' }} />
          </div>
          <div className="skeleton" style={{ width: '80px', height: '26px', borderRadius: 'var(--radius-xs)' }} />
        </div>

        {/* 2-Column Usage Grid Skeleton */}
        <div className="workspace-grid-2col" style={{ marginTop: '28px', gap: '20px' }}>
          <div style={{ background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-xs)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div className="skeleton" style={{ width: '140px', height: '14px' }} />
              <div className="skeleton" style={{ width: '60px', height: '14px' }} />
            </div>
            <div className="skeleton" style={{ width: '100%', height: '8px', borderRadius: '4px' }} />
          </div>

          <div style={{ background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-xs)', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div className="skeleton" style={{ width: '150px', height: '14px' }} />
              <div className="skeleton" style={{ width: '50px', height: '14px' }} />
            </div>
            <div className="skeleton" style={{ width: '100%', height: '8px', borderRadius: '4px' }} />
          </div>
        </div>
      </div>

      {/* Activity Ledger Skeleton */}
      <div className="skeleton-card">
        <div className="skeleton" style={{ width: '160px', height: '20px', marginBottom: '18px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
              <div className="skeleton" style={{ width: '35%', height: '14px' }} />
              <div className="skeleton" style={{ width: '25%', height: '14px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
