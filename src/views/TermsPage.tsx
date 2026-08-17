import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Shield, CheckCircle2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '64px 24px 100px' }}>
      {/* Back button */}
      <button
        className="btn-ghost"
        style={{ marginBottom: '32px', paddingLeft: 0 }}
        onClick={() => navigate(-1)}
      >
        Back
      </button>

      {/* Header */}
      <div className="section-header" style={{ marginBottom: '40px' }}>
        <span className="section-eyebrow">LEGAL &bull; OPERATING AGREEMENT</span>
        <h1 className="section-title" style={{ fontSize: '36px', marginBottom: '12px' }}>
          Terms of Service
        </h1>
        <p className="section-subtitle" style={{ fontSize: '15px' }}>
          Last updated: August 17, 2026 &bull; Terms governing access and use of StreetCraft.
        </p>
      </div>

      {/* Content Container */}
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
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using StreetCraft (&quot;StreetCraft,&quot; &quot;the Service&quot;), you agree to be bound by these Terms of Service. If you are registering on behalf of a physical business entity (such as a café, restaurant, salon, bakery, or retail boutique), you represent that you have the authority to bind that entity to these terms.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
            2. Description of Service
          </h2>
          <p>
            StreetCraft provides local business operators with automated marketing campaign creation, Opportunity Engines, and multi-channel asset compilation across Google Business, Instagram, WhatsApp, and in-store printed proofs.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
            3. Commercial Plans &amp; Quota Enforcement
          </h2>
          <p style={{ marginBottom: '12px' }}>
            Access to StreetCraft is provided under Free and Paid subscription tiers:
          </p>
          <ul style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Free Tier:</strong> Includes up to 3 marketing campaigns per calendar month and up to 2 physical storefront profiles.
            </li>
            <li>
              <strong>Founder Tier:</strong> Special introductory tier granting up to 100 monthly campaigns and 5 storefront locations under quarterly or annual billing.
            </li>
            <li>
              <strong>Pro &amp; Growth Tiers:</strong> Paid subscriptions with enhanced campaign limits (100 to 300 campaigns/month) and multi-location management (up to 10 stores).
            </li>
          </ul>
          <p style={{ marginTop: '12px' }}>
            Monthly campaign allocations reset on the first day of each billing cycle and do not roll over to subsequent periods.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
            4. Ownership &amp; Intellectual Property
          </h2>
          <p>
            <strong>Your Store Data:</strong> You retain 100% ownership of your trademarks, menu items, store photography, and brand identifiers.
          </p>
          <p style={{ marginTop: '8px' }}>
            <strong>Generated Campaign Proofs:</strong> All copy, captions, hashtags, and poster materials generated for your store become your property upon generation. You are free to publish, print, edit, and broadcast these assets across any marketing channel.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
            5. Subscriptions, Cancellation &amp; Refunds
          </h2>
          <p>
            Paid subscriptions recur on a monthly, quarterly, or annual basis. You may cancel your subscription at any time directly through your Billing Settings. Upon cancellation, your workspace remains active until the end of the prepaid billing period, after which it safely transitions to the Free tier without loss of existing campaign history.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
            6. Limitation of Liability
          </h2>
          <p>
            StreetCraft is provided &quot;as is&quot; and &quot;as available.&quot; While our validation engine enforces channel schema limits (character lengths, hashtag formatting, price sanity), operators remain responsible for reviewing offers and promotional pricing prior to customer publication.
          </p>
        </section>

        <section>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', marginBottom: '12px', color: 'var(--color-ink)' }}>
            7. Contact Information
          </h2>
          <p>
            For legal inquiries or questions regarding these terms, please contact <strong>legal@streetcraft.in</strong>.
          </p>
        </section>
      </div>
    </div>
  );
};
