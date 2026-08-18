import React from 'react';
import Link from 'next/link';

export function PrivacyFooter() {
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
      <div style={{ display: 'flex', gap: '24px' }}>
        <Link href="/terms" className="footer-link" style={{ width: 'auto', display: 'inline' }}>
          Terms of Service
        </Link>
        <Link href="/contact" className="footer-link" style={{ width: 'auto', display: 'inline' }}>
          Contact Support
        </Link>
        <Link href="/" className="footer-link" style={{ width: 'auto', display: 'inline' }}>
          Home
        </Link>
      </div>
    </footer>
  );
}
