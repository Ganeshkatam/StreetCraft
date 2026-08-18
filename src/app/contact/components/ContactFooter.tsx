import React from 'react';
import Link from 'next/link';

export function ContactFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        marginTop: '64px',
        paddingTop: '32px',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        fontSize: '13px',
        color: 'var(--color-ink-muted)',
      }}
    >
      <div>&copy; {currentYear} StreetCraft. All rights reserved.</div>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        <Link href="/pricing" className="footer-link" style={{ width: 'auto', display: 'inline' }}>
          Pricing &amp; Plans
        </Link>
        <Link href="/how-it-works" className="footer-link" style={{ width: 'auto', display: 'inline' }}>
          How It Works
        </Link>
        <Link href="/terms" className="footer-link" style={{ width: 'auto', display: 'inline' }}>
          Terms of Service
        </Link>
        <Link href="/privacy" className="footer-link" style={{ width: 'auto', display: 'inline' }}>
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
