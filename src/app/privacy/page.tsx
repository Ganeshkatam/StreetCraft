import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '../components/PublicHeader';
import { ServerFooter } from '../components/ServerFooter';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — StreetCraft',
  description: 'StreetCraft data privacy policy, security standards, and zero-data-brokering pledge for store operators.',
};

export default function PrivacyPage() {
  return (
    <>
      <PublicHeader />

      <main style={{ maxWidth: '840px', margin: '0 auto', padding: '64px var(--space-gutter) 100px' }}>
        <Link
          href="/"
          className="btn-ghost"
          style={{ marginBottom: '32px', paddingLeft: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          Back to home
        </Link>

        <div className="section-header" style={{ marginBottom: '40px' }}>
          <span className="section-eyebrow">LEGAL &bull; DATA PRIVACY POLICY</span>
          <h1 className="section-title" style={{ fontSize: '36px', marginBottom: '12px' }}>
            Privacy Policy
          </h1>
          <p className="section-subtitle" style={{ fontSize: '15px' }}>
            Last updated: August 17, 2026 &bull; Effective for all StreetCraft operators and visitors.
          </p>
        </div>

        <div
          className="card"
          style={{
            padding: '40px',
            lineHeight: '1.7',
            color: 'var(--color-ink)',
            fontSize: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
          }}
        >
          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
              1. Overview &amp; Commitment
            </h2>
            <p>
              StreetCraft (&quot;we,&quot; &quot;our,&quot; or &quot;the Platform&quot;) provides automated marketing campaign generation and multi-channel asset compilation for physical retail, food, and wellness storefronts. We respect your privacy and are committed to protecting the operational data, customer contact profiles, and store credentials you share with us.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
              2. Information We Collect
            </h2>
            <p style={{ marginBottom: '12px' }}>
              We only collect information necessary to deliver, secure, and bill for our services:
            </p>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>Account Information:</strong> Name, business email address, encrypted authentication credentials, and notification preferences.
              </li>
              <li>
                <strong>Storefront Profiles:</strong> Physical business name, category, neighborhood, city, signature offerings, average ticket values, slow operating hours, and customer tone preferences.
              </li>
              <li>
                <strong>Campaign Material:</strong> Campaign drafts, custom offers, event schedules, and generated proofs across Google Business, Instagram, WhatsApp, and in-store poster formats.
              </li>
              <li>
                <strong>Billing &amp; Commercial Records:</strong> Subscription plan tier, billing cycle (monthly, quarterly, annual), payment provider reference IDs, and quota usage records. We do not store full credit card numbers; transactions are processed through PCI-DSS certified gateways (such as Razorpay).
              </li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
              3. How We Use Storefront Data
            </h2>
            <p style={{ marginBottom: '12px' }}>
              Your business context is utilized strictly for:
            </p>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Generating coordinated marketing copy tailored to your actual store rhythm and signature products.</li>
              <li>Maintaining your private Campaign Vault and campaign generation history.</li>
              <li>Enforcing commercial plan limits (e.g., maximum active businesses and monthly generation allowances).</li>
              <li>Sending critical transactional alerts, password recovery emails, and weekly store opportunity digests (if opted in).</li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              <strong>Zero Data Brokering:</strong> We never sell, rent, or trade your storefront data or customer lists to third-party advertisers or data brokers.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
              4. Multi-Tenant Isolation &amp; Security
            </h2>
            <p>
              StreetCraft employs database-level Row Level Security (RLS), multi-tenant foreign-key isolation, and encrypted SSL/TLS connections in transit and at rest. Your campaigns and store context are accessible only to authenticated members of your specific business workspace.
            </p>
          </section>
        </div>
      </main>

      <ServerFooter variant="full" />
    </>
  );
}
