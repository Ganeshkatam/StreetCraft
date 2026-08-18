import React from 'react';
import Link from 'next/link';
import { Logo } from '../../components/Logo';

export type FooterVariant = 'full' | 'compact' | 'legal';

interface ServerFooterProps {
  variant?: FooterVariant;
}

export const ServerFooter: React.FC<ServerFooterProps> = ({ variant = 'full' }) => {
  const currentYear = new Date().getFullYear();

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
      <div>&copy; {currentYear} StreetCraft</div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link href="/privacy" className="footer-link" style={{ width: 'auto', display: 'inline' }}>
          Privacy
        </Link>
        <Link href="/terms" className="footer-link" style={{ width: 'auto', display: 'inline' }}>
          Terms
        </Link>
      </div>
    </div>
  );

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
            <Link href="/" style={{ opacity: 0.7 }}>
              <Logo size="sm" />
            </Link>
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
              <span>&copy; {currentYear} StreetCraft</span>
              <Link href="/privacy" className="footer-link" style={{ width: 'auto', display: 'inline' }}>
                Privacy
              </Link>
              <Link href="/terms" className="footer-link" style={{ width: 'auto', display: 'inline' }}>
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

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
            <div style={{ maxWidth: '360px' }}>
              <div style={{ marginBottom: '12px' }}>
                <Link href="/">
                  <Logo size="md" />
                </Link>
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

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
              <div>
                <div className="footer-col-title">Platform</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link href="/how-it-works" className="footer-link">How it works</Link>
                  <Link href="/pricing" className="footer-link">Pricing</Link>
                  <Link href="/contact" className="footer-link">Contact</Link>
                </div>
              </div>
              <div>
                <div className="footer-col-title">Workspace</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link href="/login" className="footer-link">Sign in</Link>
                  <Link href="/signup" className="footer-link">Create account</Link>
                </div>
              </div>
            </div>
          </div>

          {legalBar}
        </div>
      </footer>
    );
  }

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
        <div className="footer-top-grid">
          {/* Brand Narrative */}
          <div className="footer-brand">
            <div style={{ marginBottom: '16px' }}>
              <Link href="/">
                <Logo size="md" />
              </Link>
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
              <Link href="/how-it-works" className="footer-link">How it works</Link>
              <Link href="/free-tool" className="footer-link">Free campaign tool</Link>
              <Link href="/pricing" className="footer-link">Pricing</Link>
              <Link href="/contact" className="footer-link">Contact</Link>
            </div>
          </div>

          {/* Col 2: Customer Touchpoints */}
          <div>
            <div className="footer-col-title">Customer Touchpoints</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/touchpoints/google-business" className="footer-link">Google Business</Link>
              <Link href="/touchpoints/instagram" className="footer-link">Instagram</Link>
              <Link href="/touchpoints/whatsapp" className="footer-link">WhatsApp</Link>
              <Link href="/touchpoints/in-store-print" className="footer-link">In-store print</Link>
            </div>
          </div>

          {/* Col 3: For Your Business */}
          <div>
            <div className="footer-col-title">For Your Business</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/solutions/cafes-and-bakeries" className="footer-link">Caf&eacute;s &amp; Bakeries</Link>
              <Link href="/solutions/restaurants-and-food" className="footer-link">Restaurants &amp; Food</Link>
              <Link href="/solutions/salons-and-studios" className="footer-link">Salons &amp; Studios</Link>
              <Link href="/solutions/retail-and-boutiques" className="footer-link">Retail &amp; Boutiques</Link>
            </div>
          </div>

          {/* Col 4: Workspace */}
          <div>
            <div className="footer-col-title">Workspace</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/user/today" className="footer-link">Today</Link>
              <Link href="/user/create" className="footer-link">Create</Link>
              <Link href="/user/campaigns" className="footer-link">Campaigns</Link>
              <Link href="/user/business" className="footer-link">Business</Link>
              <Link href="/login" className="footer-link">Sign in</Link>
            </div>
          </div>
        </div>

        {legalBar}
      </div>
    </footer>
  );
};
