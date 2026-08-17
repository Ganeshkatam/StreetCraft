import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';

export type FooterVariant = 'full' | 'compact' | 'legal';

interface FooterProps {
  variant?: FooterVariant;
}

/**
 * StreetCraft Footer Component
 *
 * Three context-aware variants:
 *   full    - Complete editorial footer with brand narrative and 4 link columns.
 *             Used on: /, /how-it-works, /pricing
 *   compact - Streamlined footer with brand, core links, and legal line.
 *             Used on: /free-tool, /contact
 *   legal   - Minimal legal footer with copyright and legal links only.
 *             Used on: /privacy, /terms
 *
 * No footer is rendered on auth, onboarding, workspace (/app/*), or system routes.
 */
export const Footer: React.FC<FooterProps> = ({ variant = 'full' }) => {
  const navigate = useNavigate();

  // --- Shared: Bottom legal bar ---
  const legalBar = (
    <div
      style={{
        paddingTop: '24px',
        marginTop: variant === 'legal' ? '0' : '40px',
        borderTop: variant === 'legal' ? 'none' : '1px solid var(--color-border)',
        fontSize: '12.5px',
        color: 'var(--color-ink-muted)',
        fontFamily: 'var(--font-mono)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      <div>&copy; {new Date().getFullYear()} StreetCraft</div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          className="footer-link"
          style={{ width: 'auto', display: 'inline' }}
          onClick={() => navigate('/privacy')}
        >
          Privacy
        </button>
        <button
          className="footer-link"
          style={{ width: 'auto', display: 'inline' }}
          onClick={() => navigate('/terms')}
        >
          Terms
        </button>
      </div>
    </div>
  );

  // ==========================================================================
  // VARIANT: legal
  // Minimal: logo, copyright, privacy/terms links
  // ==========================================================================
  if (variant === 'legal') {
    return (
      <footer
        className="editorial-footer"
        style={{
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          padding: '32px 32px 28px',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div
              style={{ cursor: 'pointer', opacity: 0.7 }}
              onClick={() => navigate('/')}
            >
              <Logo size="sm" />
            </div>
            <div
              style={{
                display: 'flex',
                gap: '20px',
                fontSize: '12.5px',
                color: 'var(--color-ink-muted)',
                fontFamily: 'var(--font-mono)',
                alignItems: 'center',
              }}
            >
              <span>&copy; {new Date().getFullYear()} StreetCraft</span>
              <button
                className="footer-link"
                style={{ width: 'auto', display: 'inline' }}
                onClick={() => navigate('/privacy')}
              >
                Privacy
              </button>
              <button
                className="footer-link"
                style={{ width: 'auto', display: 'inline' }}
                onClick={() => navigate('/terms')}
              >
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // ==========================================================================
  // VARIANT: compact
  // Brand tagline + core navigation links + legal bar
  // ==========================================================================
  if (variant === 'compact') {
    return (
      <footer
        className="editorial-footer"
        style={{
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          padding: '40px 32px 32px',
          marginTop: 'auto',
        }}
      >
        <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '32px',
            }}
          >
            {/* Brand */}
            <div style={{ maxWidth: '360px' }}>
              <div
                style={{ marginBottom: '12px', cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                <Logo size="md" />
              </div>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  lineHeight: '1.45',
                  margin: '0 0 6px 0',
                  fontFamily: 'var(--font-display)',
                }}
              >
                Turn one business opportunity into everything customers need to see.
              </p>
              <p
                style={{
                  fontSize: '12.5px',
                  color: 'var(--color-ink-muted)',
                  lineHeight: '1.55',
                  margin: 0,
                }}
              >
                For physical businesses that want more customers through the door.
              </p>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <div>
                <div className="footer-col-title">Platform</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="footer-link" onClick={() => navigate('/how-it-works')}>
                    How it works
                  </button>
                  <button className="footer-link" onClick={() => navigate('/pricing')}>
                    Pricing
                  </button>
                  <button className="footer-link" onClick={() => navigate('/contact')}>
                    Contact
                  </button>
                </div>
              </div>
              <div>
                <div className="footer-col-title">Workspace</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button className="footer-link" onClick={() => navigate('/login')}>
                    Sign in
                  </button>
                  <button className="footer-link" onClick={() => navigate('/signup')}>
                    Create account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {legalBar}
        </div>
      </footer>
    );
  }

  // ==========================================================================
  // VARIANT: full (default)
  // Complete editorial footer with brand narrative + 4 structured link columns
  // ==========================================================================
  return (
    <footer
      className="editorial-footer"
      style={{
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        padding: '64px 32px 40px',
        marginTop: 'auto',
      }}
    >
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>

        {/* Top Tier: Brand Narrative & 4 Structured Link Columns */}
        <div className="footer-top-grid">

          {/* Brand Column */}
          <div className="footer-brand">
            <div style={{ marginBottom: '16px', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <Logo size="md" />
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', lineHeight: '1.45', margin: '0 0 8px 0', fontFamily: 'var(--font-display)' }}>
              Turn one business opportunity into everything customers need to see.
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', lineHeight: '1.6', margin: '0 0 10px 0' }}>
              Google, Instagram, WhatsApp, and your counter &mdash; prepared together.
            </p>
            <p style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.55', margin: 0 }}>
              For physical businesses that want more customers through the door without more marketing work.
            </p>
          </div>

          {/* Col 1: Platform */}
          <div>
            <div className="footer-col-title">Platform</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="footer-link" onClick={() => navigate('/how-it-works')}>How it works</button>
              <button className="footer-link" onClick={() => navigate('/free-tool')}>Free campaign tool</button>
              <button className="footer-link" onClick={() => navigate('/pricing')}>Pricing</button>
              <button className="footer-link" onClick={() => navigate('/contact')}>Contact</button>
            </div>
          </div>

          {/* Col 2: Customer Touchpoints */}
          <div>
            <div className="footer-col-title">Customer Touchpoints</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className="footer-link" style={{ cursor: 'default' }}>Google Business</span>
              <span className="footer-link" style={{ cursor: 'default' }}>Instagram</span>
              <span className="footer-link" style={{ cursor: 'default' }}>WhatsApp</span>
              <span className="footer-link" style={{ cursor: 'default' }}>In-store print</span>
            </div>
          </div>

          {/* Col 3: For Your Business */}
          <div>
            <div className="footer-col-title">For Your Business</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className="footer-link" style={{ cursor: 'default' }}>Caf&eacute;s &amp; Bakeries</span>
              <span className="footer-link" style={{ cursor: 'default' }}>Restaurants &amp; Food</span>
              <span className="footer-link" style={{ cursor: 'default' }}>Salons &amp; Studios</span>
              <span className="footer-link" style={{ cursor: 'default' }}>Retail &amp; Boutiques</span>
            </div>
          </div>

          {/* Col 4: Workspace */}
          <div>
            <div className="footer-col-title">Workspace</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button className="footer-link" onClick={() => navigate('/app/today')}>Today</button>
              <button className="footer-link" onClick={() => navigate('/app/create')}>Create</button>
              <button className="footer-link" onClick={() => navigate('/app/campaigns')}>Campaigns</button>
              <button className="footer-link" onClick={() => navigate('/app/business')}>Business</button>
              <button className="footer-link" onClick={() => navigate('/login')}>Sign in</button>
            </div>
          </div>

        </div>

        {legalBar}

      </div>
    </footer>
  );
};
