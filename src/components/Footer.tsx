import React from 'react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="editorial-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)' }}>STREETCRAFT</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-primary)' }}>Local Studio</span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
            The local-business marketing instrument. Turn one store moment into coordinated campaign proofs across Google, Instagram, WhatsApp, and your counter.
          </p>
          <div style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-subtle)' }}>
            &copy; {new Date().getFullYear()} StreetCraft. Built for independent neighborhood stores.
          </div>
        </div>

        <div className="footer-links-group">
          <div>
            <div className="footer-col-title">Platform</div>
            <button className="footer-link" onClick={() => navigate('home')}>How it works</button>
            <button className="footer-link" onClick={() => navigate('free-tool')}>Free campaign tool</button>
            <button className="footer-link" onClick={() => navigate('pricing')}>Plans & pricing</button>
          </div>

          <div>
            <div className="footer-col-title">Workspace</div>
            <button className="footer-link" onClick={() => navigate('app/dashboard')}>Today</button>
            <button className="footer-link" onClick={() => navigate('app/create')}>Create campaign</button>
            <button className="footer-link" onClick={() => navigate('app/campaigns')}>Campaign vault</button>
            <button className="footer-link" onClick={() => navigate('app/business')}>Store memory</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
