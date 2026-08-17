import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="editorial-footer" style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', padding: '64px 32px 40px', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>

        {/* Top Tier: Brand Narrative & 4 Structured Link Columns */}
        <div className="footer-top-grid">

          {/* Brand Column */}
          <div>
            <div style={{ marginBottom: '16px', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Logo size="md" />
            </div>
            <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', lineHeight: '1.65', margin: 0, maxWidth: '340px' }}>
              A growth engine for physical businesses. Turn one business opportunity into coordinated campaign proofs across Google, Instagram, WhatsApp, and your counter.
            </p>
          </div>

          {/* Col 1: Platform */}
          <div>
            <div className="footer-col-title">Platform</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="footer-link" onClick={() => navigate('/how-it-works')}>How it works</button>
              <button className="footer-link" onClick={() => navigate('/free-tool')}>Free campaign tool</button>
              <button className="footer-link" onClick={() => navigate('/pricing')}>Plans &amp; pricing</button>
              <button className="footer-link" onClick={() => navigate('/contact')}>Talk to us</button>
            </div>
          </div>

          {/* Col 2: Channel Outputs */}
          <div>
            <div className="footer-col-title">Touchpoints</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className="footer-link" style={{ cursor: 'default' }}>Google Business</span>
              <span className="footer-link" style={{ cursor: 'default' }}>Instagram Reels &amp; Stories</span>
              <span className="footer-link" style={{ cursor: 'default' }}>WhatsApp VIP Broadcast</span>
              <span className="footer-link" style={{ cursor: 'default' }}>Printable Counter Cards</span>
            </div>
          </div>

          {/* Col 3: Store Categories */}
          <div>
            <div className="footer-col-title">Storefronts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className="footer-link" style={{ cursor: 'default' }}>Cafes &amp; Bakeries</span>
              <span className="footer-link" style={{ cursor: 'default' }}>Restaurants &amp; Bistros</span>
              <span className="footer-link" style={{ cursor: 'default' }}>Boutiques &amp; Salons</span>
              <span className="footer-link" style={{ cursor: 'default' }}>Studios &amp; Retail</span>
            </div>
          </div>

          {/* Col 4: Workspace */}
          <div>
            <div className="footer-col-title">Workspace</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="footer-link" onClick={() => navigate('/app/today')}>Today's briefing</button>
              <button className="footer-link" onClick={() => navigate('/app/create')}>Compose campaign</button>
              <button className="footer-link" onClick={() => navigate('/app/campaigns')}>Campaign vault</button>
              <button className="footer-link" onClick={() => navigate('/app/business')}>Store preferences</button>
              <button className="footer-link" onClick={() => navigate('/login')}>Sign in to store</button>
            </div>
          </div>

        </div>

        {/* Bottom Bar / Colophon */}
        <div style={{ paddingTop: '24px', borderTop: '1px solid var(--color-border)', fontSize: '12.5px', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>&copy; {new Date().getFullYear()} StreetCraft. Built for physical businesses.</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="footer-link" style={{ width: 'auto', display: 'inline' }} onClick={() => navigate('/privacy')}>Privacy Policy</button>
            <button className="footer-link" style={{ width: 'auto', display: 'inline' }} onClick={() => navigate('/terms')}>Terms of Service</button>
          </div>
        </div>

      </div>
    </footer>
  );
};
