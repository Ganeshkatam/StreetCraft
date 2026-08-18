import React from 'react';
import Link from 'next/link';
import { Logo } from '../../../components/Logo';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export function ContactHero() {
  return (
    <header className="contact-hero">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
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
        <div className="contact-hero-eyebrow">
          <MessageSquare size={14} color="var(--color-primary)" />
          <span>SUPPORT DESK &bull; GET IN TOUCH</span>
        </div>

        <h1 className="contact-hero-title">
          Talk to StreetCraft
        </h1>

        <p className="contact-hero-tagline">
          Questions about your storefront, campaigns, quotas, or getting started? Send us a note.
        </p>
      </div>
    </header>
  );
}
