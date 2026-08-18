import React from 'react';
import Link from 'next/link';
import { PublicHeader } from '../components/PublicHeader';
import { ServerFooter } from '../components/ServerFooter';
import { ArrowLeft, FileText, CheckCircle2 } from 'lucide-react';

export function TermsView() {
  return (
    <div className="landing-container">
      <PublicHeader />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '48px var(--space-gutter) 100px' }}>
        <div style={{ marginBottom: '28px' }}>
          <Link
            href="/"
            className="btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', color: 'var(--color-ink-muted)' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header Title */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary-border)', marginBottom: '16px' }}>
            <FileText size={14} color="var(--color-primary)" />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-primary)', textTransform: 'uppercase' }}>
              Legal &bull; Commercial Agreement
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', color: 'var(--color-ink)', lineHeight: '1.2', margin: '0 0 12px', letterSpacing: '-0.02em' }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-ink-muted)', margin: 0 }}>
            Last revised: August 19, 2026 &bull; Effective for all registered storefronts and physical business operators.
          </p>
        </div>

        {/* Key Summary Highlights */}
        <div
          style={{
            background: 'var(--color-surface-raised)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <CheckCircle2 size={16} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)' }}>100% Asset Ownership</div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>You own all generated copy, posters, and campaign materials.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <CheckCircle2 size={16} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)' }}>Transparent Quota</div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>No hidden overages. Monthly campaign allocations reset predictably.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <CheckCircle2 size={16} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)' }}>Cancel Anytime</div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)' }}>Retain existing campaigns and transition cleanly to the Free tier.</div>
            </div>
          </div>
        </div>

        {/* Terms Body */}
        <div
          className="card"
          style={{
            padding: '44px 40px',
            lineHeight: '1.75',
            color: 'var(--color-ink)',
            fontSize: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}
        >
          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
              1. Acceptance &amp; Storefront Authority
            </h2>
            <p>
              By creating an account, connecting a storefront, or utilizing StreetCraft (&quot;StreetCraft,&quot; &quot;the Service,&quot; &quot;we,&quot; &quot;our&quot;), you agree to be bound by these Terms of Service. If you register or operate on behalf of a physical commercial business entity (such as a café, restaurant, salon, bakery, gym, or retail boutique), you represent that you have legal authority to bind that business entity to these terms.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
              2. Platform Architecture &amp; Opportunity Engine
            </h2>
            <p>
              StreetCraft provides physical business operators with opportunity intelligence and automated 4-channel campaign generation:
            </p>
            <ul style={{ paddingLeft: '24px', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Google Business Updates:</strong> Local SEO announcements, event notices, and search-optimized promotional copy.</li>
              <li><strong>Instagram Assets:</strong> Video reel hooks, story frame sequence plans, and localized neighborhood hashtags.</li>
              <li><strong>WhatsApp Broadcasts:</strong> Instant, formatted messaging crafted for VIP customer lists and community groups.</li>
              <li><strong>In-Store Printed Touchpoints:</strong> Formatted table tents, A4/A5 counter displays, and QR redemption signage.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
              3. Storefront Entitlements &amp; Fair Usage
            </h2>
            <p style={{ marginBottom: '12px' }}>
              Access to StreetCraft features is governed by commercial plan entitlements:
            </p>
            <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <strong>Free Plan:</strong> Includes up to 3 marketing campaigns per calendar month and up to 2 physical storefront profiles with standard generation speeds.
              </li>
              <li>
                <strong>Founder Plan:</strong> Specialized tier offering up to 100 campaigns per month across 5 storefront locations with priority processing.
              </li>
              <li>
                <strong>Pro &amp; Growth Plans:</strong> Paid subscriptions providing higher monthly limits (100 to 300 campaigns/month) and multi-location management for expanding retail footprints (up to 10 stores).
              </li>
            </ul>
            <p style={{ marginTop: '12px' }}>
              Monthly generation allocations reset at the start of each billing period. Unused campaign quotas do not accumulate or roll over to subsequent months.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
              4. Intellectual Property &amp; Commercial Ownership
            </h2>
            <p>
              <strong>Your Business Assets:</strong> You retain 100% exclusive ownership of your brand name, trademarks, menu data, location details, imagery, and product pricing.
            </p>
            <p style={{ marginTop: '10px' }}>
              <strong>Generated Materials:</strong> All marketing copy, promotional themes, captions, hashtags, and printable layouts generated by StreetCraft become your property immediately upon creation. You are granted perpetual, royalty-free, worldwide rights to print, broadcast, modify, and publish these materials across any online or physical channel.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
              5. Operator Responsibility &amp; Accuracy
            </h2>
            <p>
              While StreetCraft leverages state-of-the-art marketing models to generate highly relevant promotional copy, you as the store operator remain responsible for verifying specific pricing, discount terms, festival dates, and compliance with local retail advertising laws prior to public broadcast or print distribution.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
              6. Billing, Cancellation &amp; Free Plan Transitions
            </h2>
            <p>
              Paid plans are billed in advance on a recurring monthly, quarterly, or annual cycle via verified payment gateways (such as Razorpay). You may cancel your subscription at any time directly through your workspace billing settings. Upon cancellation, your workspace retains active paid benefits until the conclusion of the prepaid period, after which it smoothly transitions to the Free tier without data loss.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
              7. Security &amp; Service Commitments
            </h2>
            <p>
              We maintain strict multi-tenant Row Level Security (RLS) to ensure your store profile, drafts, and customer notes are completely isolated from all other tenants. We strive for 99.9% platform availability and provide email and support desk access for technical assistance.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
              8. Contact &amp; Governance
            </h2>
            <p>
              For questions regarding these Terms of Service or commercial agreements, please contact our support team at <Link href="/contact" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>support@streetcraft.in</Link>.
            </p>
          </section>
        </div>
      </main>

      <ServerFooter variant="full" />
    </div>
  );
}
