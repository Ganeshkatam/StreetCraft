import React from 'react';

export default function TodayLoading() {
  return (
    <div style={{ width: '100%', padding: '24px var(--space-gutter) 80px' }}>
      {/* Today Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '320px', height: '36px', marginBottom: '6px' }} />
          <div className="skeleton" style={{ width: '220px', height: '14px' }} />
        </div>
        <div className="skeleton" style={{ width: '170px', height: '42px', borderRadius: 'var(--radius-xs)' }} />
      </div>

      {/* 2-Column Dashboard Grid */}
      <div className="workspace-grid-2col">
        {/* Left Column: Opportunities & Vault Snippet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Opportunities Card Skeleton */}
          <div className="skeleton-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div className="skeleton" style={{ width: '180px', height: '20px' }} />
              <div className="skeleton" style={{ width: '80px', height: '16px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    padding: '16px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--color-surface-raised)',
                  }}
                >
                  <div className="skeleton" style={{ width: '60%', height: '18px', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ width: '90%', height: '14px', marginBottom: '12px' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="skeleton" style={{ width: '90px', height: '28px' }} />
                    <div className="skeleton" style={{ width: '70px', height: '28px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Vault Snippet Skeleton */}
          <div className="skeleton-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div className="skeleton" style={{ width: '160px', height: '20px' }} />
              <div className="skeleton" style={{ width: '70px', height: '14px' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    background: 'var(--color-surface-raised)',
                    borderRadius: 'var(--radius-xs)',
                  }}
                >
                  <div className="skeleton" style={{ width: '45%', height: '15px' }} />
                  <div className="skeleton" style={{ width: '70px', height: '18px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Context, Quota & Festivals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Storefront Context Skeleton */}
          <div className="skeleton-card">
            <div className="skeleton" style={{ width: '140px', height: '18px', marginBottom: '14px' }} />
            <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '80%', height: '14px' }} />
          </div>

          {/* Quota Panel Skeleton */}
          <div className="skeleton-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div className="skeleton" style={{ width: '120px', height: '16px' }} />
              <div className="skeleton" style={{ width: '60px', height: '16px' }} />
            </div>
            <div className="skeleton" style={{ width: '100%', height: '8px', borderRadius: '4px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '36px', borderRadius: 'var(--radius-xs)' }} />
          </div>

          {/* Upcoming Festivals Skeleton */}
          <div className="skeleton-card">
            <div className="skeleton" style={{ width: '150px', height: '18px', marginBottom: '14px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="skeleton" style={{ width: '55%', height: '14px' }} />
                  <div className="skeleton" style={{ width: '50px', height: '18px' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
