import React from 'react';

export default function CreateCampaignLoading() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px var(--space-gutter) 80px', width: '100%' }}>
      {/* Header Skeleton */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '140px', height: '14px', margin: '0 auto 8px' }} />
        <div className="skeleton" style={{ width: '280px', height: '34px', margin: '0 auto 8px' }} />
        <div className="skeleton" style={{ width: '380px', height: '14px', margin: '0 auto' }} />
      </div>

      {/* Stepper Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '32px',
          background: 'var(--color-surface)',
          padding: '16px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--color-border)',
        }}
      >
        {[1, 2, 3, 4].map((step) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0 }} />
            <div className="skeleton" style={{ width: '70%', height: '14px' }} />
          </div>
        ))}
      </div>

      {/* Form Panel Skeleton */}
      <div className="skeleton-card">
        <div className="skeleton" style={{ width: '220px', height: '22px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ width: '80%', height: '14px', marginBottom: '24px' }} />

        {/* Input Field Skeletons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
          <div>
            <div className="skeleton" style={{ width: '120px', height: '14px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '100%', height: '44px', borderRadius: 'var(--radius-xs)' }} />
          </div>
          <div>
            <div className="skeleton" style={{ width: '140px', height: '14px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '100%', height: '88px', borderRadius: 'var(--radius-xs)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ height: '70px', borderRadius: 'var(--radius-xs)' }} />
            ))}
          </div>
        </div>

        {/* Action Button Skeletons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
          <div className="skeleton" style={{ width: '100px', height: '38px', borderRadius: 'var(--radius-xs)' }} />
          <div className="skeleton" style={{ width: '140px', height: '38px', borderRadius: 'var(--radius-xs)' }} />
        </div>
      </div>
    </div>
  );
}
