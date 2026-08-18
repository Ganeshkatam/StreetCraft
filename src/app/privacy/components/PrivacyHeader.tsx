import React from 'react';
import Link from 'next/link';
import { Logo } from '../../../components/Logo';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export function PrivacyHeader() {
  return (
    <header className="privacy-hero">
      <div className="privacy-hero-header">
        <Link href="/" aria-label="StreetCraft Home">
          <Logo size="sm" />
        </Link>
        <Link
          href="/"
          className="btn-ghost"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px' }}
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </div>

      <div>
        <div className="privacy-hero-eyebrow">
          <ShieldCheck size={14} color="var(--color-primary)" />
          <span>Data Privacy &bull; Zero Brokering Pledge</span>
        </div>

        <h1 className="privacy-hero-title">
          Privacy Policy
        </h1>

        <p className="privacy-hero-tagline">
          Your data. Your business. Your control.
        </p>

        <p className="privacy-hero-meta">
          Last revised: August 19, 2026 &bull; Strict confidentiality and multi-tenant isolation standards for all physical storefronts.
        </p>
      </div>
    </header>
  );
}
