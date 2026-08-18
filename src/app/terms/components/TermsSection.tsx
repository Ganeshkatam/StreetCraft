import React from 'react';

interface TermsSectionProps {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}

export function TermsSection({ id, number, title, children }: TermsSectionProps) {
  return (
    <section id={id} className="privacy-section-card">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '14px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--color-primary)',
          }}
        >
          {number}
        </span>
        <h2 className="privacy-section-title" style={{ margin: 0 }}>
          {title}
        </h2>
      </div>
      <div>{children}</div>
    </section>
  );
}
