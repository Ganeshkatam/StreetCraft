import React from 'react';

export default function CampaignsLoading() {
  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px', width: '100%' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div className="skeleton" style={{ width: '150px', height: '14px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '240px', height: '32px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '380px', height: '14px' }} />
        </div>
        <div className="skeleton" style={{ width: '150px', height: '40px', borderRadius: 'var(--radius-xs)' }} />
      </div>

      {/* Filter / Toggle Bar Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ width: '75px', height: '32px', borderRadius: '20px' }} />
          ))}
        </div>
        <div className="skeleton" style={{ width: '160px', height: '32px', borderRadius: 'var(--radius-xs)' }} />
      </div>

      {/* Campaign Cards Skeleton Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div className="skeleton" style={{ width: '90px', height: '18px', borderRadius: '12px' }} />
              <div className="skeleton" style={{ width: '70px', height: '14px' }} />
            </div>
            <div className="skeleton" style={{ width: '85%', height: '22px', marginBottom: '10px' }} />
            <div className="skeleton" style={{ width: '100%', height: '14px', marginBottom: '6px' }} />
            <div className="skeleton" style={{ width: '65%', height: '14px', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '6px', paddingTop: '14px', borderTop: '1px solid var(--color-border)' }}>
              <div className="skeleton" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
              <div className="skeleton" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
              <div className="skeleton" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
