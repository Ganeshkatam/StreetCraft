import React from 'react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer style={{ borderTop: '1px solid var(--border-editorial)', padding: '36px 48px', marginTop: 'auto', background: 'var(--bg-canvas)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1080px', margin: '0 auto', fontSize: '13px', color: 'var(--color-muted)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px' }}>
          STREETCRAFT &mdash; Local business marketing instrument &copy; 2026.
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button className="nav-item" onClick={() => navigate('home')}>
            How it works
          </button>
          <button className="nav-item" onClick={() => navigate('free-tool')}>
            Free tool
          </button>
          <button className="nav-item" onClick={() => navigate('pricing')}>
            Pricing
          </button>
          <button className="nav-item" onClick={() => navigate('app/dashboard')}>
            Workspace
          </button>
        </div>
      </div>
    </footer>
  );
};
