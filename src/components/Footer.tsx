import React from 'react';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  return (
    <footer className="modern-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div className="brand-logo-icon" style={{ width: '28px', height: '28px', fontSize: '13px' }}>S</div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>StreetCraft AI</span>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
            The AI Content Studio & multi-channel campaign engine built for neighborhood businesses.
          </p>
          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            &copy; {new Date().getFullYear()} StreetCraft AI. All rights reserved.
          </div>
        </div>

        <div className="footer-links-group">
          <div>
            <div className="footer-col-title">Platform</div>
            <button className="footer-link" onClick={() => navigate('home')}>Overview</button>
            <button className="footer-link" onClick={() => navigate('free-tool')}>Free Generator</button>
            <button className="footer-link" onClick={() => navigate('pricing')}>Plans & Pricing</button>
          </div>

          <div>
            <div className="footer-col-title">Studio</div>
            <button className="footer-link" onClick={() => navigate('app/dashboard')}>Dashboard</button>
            <button className="footer-link" onClick={() => navigate('app/create')}>Campaign Wizard</button>
            <button className="footer-link" onClick={() => navigate('app/campaigns')}>Campaign Vault</button>
            <button className="footer-link" onClick={() => navigate('app/business')}>Store Memory</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
