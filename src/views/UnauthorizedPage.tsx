import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Store } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '520px',
          width: '100%',
          padding: '48px 36px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-overlay)',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#b91c1c',
          }}
        >
          <ShieldAlert size={28} />
        </div>

        <span className="section-eyebrow" style={{ marginBottom: '8px', color: '#b91c1c' }}>
          403 &bull; ACCESS RESTRICTED
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
            color: 'var(--color-ink)',
            marginBottom: '12px',
          }}
        >
          Permission Required
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-ink-muted)',
            lineHeight: '1.6',
            marginBottom: '28px',
          }}
        >
          You do not have permission to view or manage this storefront resource. Please verify your active store workspace or sign in with an authorized account.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Go Back
          </button>
          <button className="btn-secondary" onClick={() => navigate('/app/business')}>
            <Store size={15} /> Storefronts
          </button>
          <button className="btn-primary" onClick={() => navigate('/app/today')}>
            <LayoutDashboard size={15} /> Today&apos;s Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
