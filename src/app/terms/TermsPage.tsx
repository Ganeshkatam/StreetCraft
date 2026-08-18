import React from 'react';
import Link from 'next/link';
import { Logo } from '../../components/Logo';
import { TermsContents } from './components/TermsContents';
import { TermsSection } from './components/TermsSection';
import { TermsFooter } from './components/TermsFooter';
import { ArrowLeft, FileText, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="privacy-page-wrapper">
      <div className="privacy-page-container">
        {/* Header */}
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
              <FileText size={14} color="var(--color-primary)" />
              <span>Commercial Terms &bull; Operating Agreement</span>
            </div>

            <h1 className="privacy-hero-title">
              Terms of Service
            </h1>

            <p className="privacy-hero-tagline">
              Commercial agreement and operational responsibilities for physical storefront operators.
            </p>

            <p className="privacy-hero-meta">
              Last updated: August 19, 2026 &bull; Effective for all registered storefronts and physical business operators.
            </p>
          </div>
        </header>

        {/* Key Guarantees Summary */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <CheckCircle2 size={18} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '2px' }}>100% Asset Ownership</div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>You own all generated marketing copy, posters, and campaign files.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <ShieldCheck size={18} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '2px' }}>Predictable Quotas</div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>Monthly campaign allocations reset cleanly without hidden overages.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <AlertCircle size={18} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '2px' }}>Operator Review</div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>Operators review pricing and details before public broadcast or printing.</div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="privacy-layout-grid">
          <TermsContents />

          <div className="privacy-main-column">
            <TermsSection id="agreement" number="01" title="Agreement &amp; Eligibility">
              <p className="privacy-section-text">
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you (&quot;Operator,&quot; &quot;User,&quot; or &quot;You&quot;) and StreetCraft (&quot;StreetCraft,&quot; &quot;Platform,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) governing your access to and use of the StreetCraft software, website, and related marketing generation tools.
              </p>
              <p className="privacy-section-text">
                By accessing StreetCraft, creating an account, or connecting a commercial storefront, you affirm that you are at least 18 years of age and possess full legal authority to bind yourself or the legal commercial entity you represent (such as a café, bakery, restaurant, salon, boutique, or retail store) to these Terms.
              </p>
            </TermsSection>

            <TermsSection id="services" number="02" title="StreetCraft Services">
              <p className="privacy-section-text">
                StreetCraft provides local business operators with automated marketing campaign creation, opportunity detection, and coordinated 4-channel output compilation across Google Business updates, Instagram Reel/Story concepts, WhatsApp VIP broadcasts, and in-store printed point-of-sale assets.
              </p>
              <p className="privacy-section-text">
                We continuously refine and optimize our campaign generation engines. We reserve the right to update, modify, enhance, or deprecate specific features, formatting presets, or capability specifications with reasonable advance notice where feasible.
              </p>
            </TermsSection>

            <TermsSection id="accounts" number="03" title="Accounts &amp; Authentication">
              <p className="privacy-section-text">
                To access authenticated storefront configuration and campaign generation, you must create an account. You agree to provide accurate, current, and complete business information and maintain the security of your authentication credentials.
              </p>
              <p className="privacy-section-text">
                <strong>Strict Email Verification:</strong> Operator accounts require verified email confirmation prior to profile activation. Unconfirmed signup records older than 1 hour are automatically purged from our database via scheduled automated maintenance routines.
              </p>
            </TermsSection>

            <TermsSection id="storefronts" number="04" title="Storefronts &amp; Business Data">
              <p className="privacy-section-text">
                You represent and warrant that you hold legitimate commercial authority to configure and manage every physical storefront profile registered under your account, including business trade names, neighborhood landmark anchors, signature menus, product pricing, and operating hours.
              </p>
              <p className="privacy-section-text">
                Every business storefront is isolated through database-level Row Level Security (RLS). You may assign team members (Owners, Admins, Members) to specific storefront workspaces, and you remain responsible for actions taken by authorized collaborators.
              </p>
            </TermsSection>

            <TermsSection id="ai-content" number="05" title="Campaign Generation &amp; AI Content">
              <p className="privacy-section-text">
                StreetCraft uses specialized generative intelligence models to synthesize coordinated, character-compliant marketing assets based on your stored business context and selected opportunity triggers.
              </p>
              <p className="privacy-section-text">
                <strong>Assistance Mechanism &amp; Human Review:</strong> Generated marketing copy, captions, hashtags, and printable layouts are designed as high-velocity operational drafts. As the store operator, you remain strictly responsible for reviewing all generated content, item pricing, discount terms, festival dates, and allergen notes prior to printing or broadcasting to the public.
              </p>
            </TermsSection>

            <TermsSection id="responsibilities" number="06" title="Customer Responsibilities">
              <p className="privacy-section-text">
                You agree not to use StreetCraft for any unlawful purpose, including:
              </p>
              <ul className="privacy-section-list">
                <li>Publishing false, misleading, fraudulent, or deceptive commercial promotions.</li>
                <li>Violating local consumer protection, retail pricing, or fair advertising standards.</li>
                <li>Infringing upon third-party trademarks, copyrights, or trade secrets.</li>
                <li>Attempting to reverse engineer, scrape, bypass rate limits, or disrupt platform infrastructure.</li>
              </ul>
            </TermsSection>

            <TermsSection id="billing" number="07" title="Subscriptions, Billing &amp; Quotas">
              <p className="privacy-section-text">
                StreetCraft offers Free and Paid commercial subscription tiers (including Starter, Pro, Growth, and special introductory Founder tiers).
              </p>
              <ul className="privacy-section-list">
                <li><strong>Monthly Quota Allotment:</strong> Each plan provides a specific monthly allowance of marketing campaign generations. Quota allocations reset at the start of each billing cycle and do not accumulate or roll over.</li>
                <li><strong>Billing Cycles:</strong> Paid subscriptions are billed in advance on recurring monthly, quarterly, or annual schedules through certified PCI-DSS payment gateways (such as Razorpay).</li>
                <li><strong>Taxes:</strong> All fees are exclusive of applicable GST or local sales taxes unless explicitly stated otherwise.</li>
              </ul>
            </TermsSection>

            <TermsSection id="cancellation" number="08" title="Cancellation &amp; Account Closure">
              <p className="privacy-section-text">
                You may cancel your commercial subscription at any time directly through your workspace billing settings. Upon cancellation, your account retains active paid entitlements until the conclusion of the prepaid period.
              </p>
              <p className="privacy-section-text">
                Following expiration, your workspace smoothly transitions to the Free plan. Because StreetCraft employs archive-only campaign history semantics, existing campaign records remain safely preserved in read-only format unless you explicitly request permanent account deletion.
              </p>
            </TermsSection>

            <TermsSection id="ip" number="09" title="Intellectual Property">
              <p className="privacy-section-text">
                <strong>Your Business Assets:</strong> You retain 100% exclusive intellectual property ownership of your store trademarks, photography, logos, menu items, and proprietary recipes.
              </p>
              <p className="privacy-section-text">
                <strong>Generated Campaign Materials:</strong> You own all right, title, and interest in and to the marketing copy, captions, hashtags, and printable poster designs generated for your storefront. You are granted perpetual, royalty-free, worldwide commercial rights to publish, broadcast, print, and monetize these assets across any medium.
              </p>
            </TermsSection>

            <TermsSection id="third-parties" number="10" title="Third-Party Platforms">
              <p className="privacy-section-text">
                StreetCraft generates structured assets formatted for third-party publishing platforms, including Google Business Profile, Instagram (Meta), WhatsApp (Meta), Brevo, and Razorpay.
              </p>
              <p className="privacy-section-text">
                These external platforms operate independently. StreetCraft does not control, and shall not be liable for, third-party platform uptime, algorithm ranking shifts, account suspensions, API modifications, or content moderation decisions enacted by external providers.
              </p>
            </TermsSection>

            <TermsSection id="privacy" number="11" title="Privacy &amp; Data Processing">
              <p className="privacy-section-text">
                Your use of StreetCraft is subject to our <Link href="/privacy" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Privacy Policy</Link>, which details our strict zero-data-brokering pledge, multi-tenant PostgreSQL Row Level Security (RLS), and data retention practices.
              </p>
            </TermsSection>

            <TermsSection id="disclaimers" number="12" title="Disclaimers">
              <p className="privacy-section-text">
                STREETCRAFT IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE SPECIFIC REVENUE INCREASES, MAP PACK SEARCH RANKINGS, SOCIAL ENGAGEMENT METRICS, OR FOOTFALL CONVERSIONS RESULTING FROM GENERATED CAMPAIGNS.
              </p>
            </TermsSection>

            <TermsSection id="liability" number="13" title="Limitation of Liability">
              <p className="privacy-section-text">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, STREETCRAFT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS REPUTATION ARISING FROM YOUR USE OF THE SERVICE.
              </p>
              <p className="privacy-section-text">
                OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIM UNDER THESE TERMS SHALL NOT EXCEED THE TOTAL FEES ACTUALLY PAID BY YOU TO STREETCRAFT DURING THE THREE (3) MONTHS IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO LIABILITY.
              </p>
            </TermsSection>

            <TermsSection id="indemnity" number="14" title="Indemnification">
              <p className="privacy-section-text">
                You agree to defend, indemnify, and hold harmless StreetCraft and its officers, directors, and employees from and against any third-party claims, damages, liabilities, and expenses arising out of your storefront operations, breach of these Terms, or marketing claims published by your business.
              </p>
            </TermsSection>

            <TermsSection id="termination" number="15" title="Suspension &amp; Termination">
              <p className="privacy-section-text">
                We may suspend or terminate your account access immediately if you breach these Terms, engage in fraudulent billing activity, or utilize the platform for abusive or malicious activities.
              </p>
            </TermsSection>

            <TermsSection id="governing-law" number="16" title="Governing Law">
              <p className="privacy-section-text">
                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka.
              </p>
            </TermsSection>

            <TermsSection id="modifications" number="17" title="Changes to These Terms">
              <p className="privacy-section-text">
                We may modify these Terms periodically to reflect changes in our service offerings or legal regulations. Updated versions will be published on this page with an updated revision date. Continued use of the platform after notice constitutes acceptance of the amended terms.
              </p>
            </TermsSection>

            <TermsSection id="contact" number="18" title="Contact &amp; Operator Support">
              <p className="privacy-section-text">
                For questions concerning these Terms of Service or commercial agreements, please contact our support desk at{' '}
                <Link href="/contact" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  support@streetcraft.in
                </Link>{' '}
                or reach out via our direct founder support channels.
              </p>
            </TermsSection>
          </div>
        </div>

        <TermsFooter />
      </div>
    </div>
  );
}
