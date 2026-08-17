import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowLeft, LayoutDashboard, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
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
            background: 'var(--color-primary-subtle)',
            border: '1px solid var(--color-primary-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--color-primary)',
          }}
        >
          <Compass size={28} />
        </div>

        <span className="section-eyebrow" style={{ marginBottom: '8px' }}>
          404 &bull; PAGE NOT FOUND
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
            color: 'var(--color-ink)',
            marginBottom: '12px',
          }}
        >
          Lost on the Street?
        </h1>

        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-ink-muted)',
            lineHeight: '1.6',
            marginBottom: '28px',
          }}
        >
          The page or campaign document you are looking for does not exist or has been relocated.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Go Back
          </button>
          <button className="btn-primary" onClick={() => navigate('/app/today')}>
            <LayoutDashboard size={15} /> Today&apos;s Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
