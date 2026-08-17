import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';

export const ErrorPage: React.FC<{ message?: string }> = ({ message }) => {
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
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--color-ink-muted)',
          }}
        >
          <AlertCircle size={28} />
        </div>

        <span className="section-eyebrow" style={{ marginBottom: '8px' }}>
          SYSTEM &bull; UNEXPECTED STATE
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
            color: 'var(--color-ink)',
            marginBottom: '12px',
          }}
        >
          Something Went Wrong
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-ink-muted)',
            lineHeight: '1.6',
            marginBottom: '28px',
          }}
        >
          {message || 'An unexpected error occurred while loading this page. Your store data and campaigns remain safe and untouched.'}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Refresh Page
          </button>
          <button className="btn-primary" onClick={() => navigate('/app/today')}>
            <LayoutDashboard size={15} /> Today&apos;s Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
