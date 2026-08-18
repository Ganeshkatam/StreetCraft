import React from 'react';
import Link from 'next/link';
import { PrivacyHeader } from './components/PrivacyHeader';
import { PrivacyContents } from './components/PrivacyContents';
import { PrivacySection } from './components/PrivacySection';
import { PrivacyFooter } from './components/PrivacyFooter';
import { Lock, Database, UserCheck, Shield } from 'lucide-react';

export function PrivacyPage() {
  return (
    <div className="privacy-page-wrapper">
      <div className="privacy-page-container">
        <PrivacyHeader />

        {/* Core Guarantees Bar */}
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
            <Lock size={18} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '2px' }}>Zero Data Brokering</div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>We never sell, rent, or trade your storefront data to third parties.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Database size={18} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '2px' }}>Row-Level Isolation</div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>PostgreSQL RLS ensures your store context is isolated to your team.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <UserCheck size={18} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '2px' }}>Export &amp; Erasure</div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>You have full authority to export or permanently delete store data.</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Shield size={18} color="var(--color-primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '2px' }}>Encrypted Channels</div>
              <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>Strict TLS 1.3 in transit and cryptographic hashing at rest.</div>
            </div>
          </div>
        </div>

        {/* 2-Column Editorial Grid */}
        <div className="privacy-layout-grid">
          {/* Sidebar Table of Contents */}
          <PrivacyContents />

          {/* Main Legal Content Stream */}
          <div className="privacy-main-column">
            <PrivacySection id="overview" title="1. Overview &amp; Our Commitment">
              <p className="privacy-section-text">
                StreetCraft (&quot;we,&quot; &quot;our,&quot; or &quot;the Platform&quot;) develops specialized growth and marketing software for physical storefronts—including cafés, bakeries, restaurants, salons, studios, and independent retail shops.
              </p>
              <p className="privacy-section-text">
                We believe that your store data, menu pricing, slow-hour rhythms, and customer demographics represent the core value of your business. We treat your business operational profile with strict confidentiality and never monetize your data through advertising brokers or third-party behavioral networks.
              </p>
            </PrivacySection>

            <PrivacySection id="collection" title="2. Information We Collect">
              <p className="privacy-section-text">
                We collect only the minimum necessary information required to generate localized campaign packs and maintain secure platform operations:
              </p>
              <ul className="privacy-section-list">
                <li>
                  <strong>Account &amp; Authentication Credentials:</strong> Your full name, verified business email address, encrypted password hash, and notification preferences.
                </li>
                <li>
                  <strong>Physical Storefront Operational Profile:</strong> Store business name, retail category, neighborhood, city, landmark anchors, signature offerings, average ticket values, slow/peak operating hours, and brand tone.
                </li>
                <li>
                  <strong>Campaign &amp; Generation Vault:</strong> Generated copy proofs, custom offers, event schedules, in-store poster layouts, and publication logs across Google Business, Instagram, WhatsApp, and print formats.
                </li>
                <li>
                  <strong>Commercial Billing Records:</strong> Subscription plan tier, billing frequency (monthly, quarterly, annual), quota usage metrics, and encrypted payment gateway transaction reference identifiers. Raw credit card numbers are never stored on StreetCraft servers.
                </li>
              </ul>
            </PrivacySection>

            <PrivacySection id="usage" title="3. How We Use Information">
              <p className="privacy-section-text">
                Storefront data is utilized strictly for executing platform features and delivering your marketing assets:
              </p>
              <ul className="privacy-section-list">
                <li>Synthesizing coordinated, character-compliant marketing copy tailored to your exact store identity.</li>
                <li>Maintaining your private campaign history, custom templates, and instant re-generation workspace.</li>
                <li>Enforcing subscription quota limits to guarantee equitable AI compute allocation.</li>
                <li>Delivering critical transactional notifications, security verification emails, and opt-in weekly opportunity digests.</li>
              </ul>
            </PrivacySection>

            <PrivacySection id="security" title="4. Technical Security &amp; Multi-Tenant Isolation">
              <p className="privacy-section-text">
                StreetCraft enforces database-level Row Level Security (RLS) policies within PostgreSQL. Every campaign draft, store setting, and operational metric is strictly bound to authenticated business team members.
              </p>
              <p className="privacy-section-text">
                All communications between your browser and our servers are encrypted via TLS 1.3. Stored database records are encrypted at rest with AES-256 standard encryption.
              </p>
            </PrivacySection>

            <PrivacySection id="third-parties" title="5. Service Providers &amp; Data Sharing">
              <p className="privacy-section-text">
                We partner with dedicated infrastructure providers to operate the service. We do not sell or broker your data:
              </p>
              <ul className="privacy-section-list">
                <li>
                  <strong>Transactional Email &amp; Digests:</strong> Brevo (DKIM/SPF-signed transactional delivery and notification infrastructure).
                </li>
                <li>
                  <strong>Database &amp; Authentication:</strong> Supabase (PostgreSQL with RLS and PKCE secure session management).
                </li>
                <li>
                  <strong>Payment Processing:</strong> Razorpay (PCI-DSS Level 1 compliant payment gateway).
                </li>
              </ul>
              <p className="privacy-section-text" style={{ marginTop: '14px' }}>
                <strong>Zero Ad Retargeting:</strong> We do not run third-party cross-site trackers or sell store behavioral profiles to digital ad networks.
              </p>
            </PrivacySection>

            <PrivacySection id="retention" title="6. Data Retention &amp; Erasure">
              <p className="privacy-section-text">
                We retain your storefront profile and campaign vault for as long as your account remains active. Unverified signup records older than 1 hour are automatically purged via scheduled database maintenance routines.
              </p>
              <p className="privacy-section-text">
                Upon account cancellation, your data remains accessible in read-only format under the Free tier. If you request full account erasure, all associated business records, campaigns, and membership links will be permanently deleted within 30 days.
              </p>
            </PrivacySection>

            <PrivacySection id="rights" title="7. Your Rights &amp; Control">
              <p className="privacy-section-text">
                As a storefront operator, you maintain complete authority over your information:
              </p>
              <ul className="privacy-section-list">
                <li><strong>Access &amp; Export:</strong> You can export your generated campaign copy and store context at any time.</li>
                <li><strong>Correction:</strong> You can update your business address, signature items, and tone settings directly in your workspace.</li>
                <li><strong>Erasure:</strong> You can request permanent account and storefront deletion with immediate effect.</li>
              </ul>
            </PrivacySection>

            <PrivacySection id="contact" title="8. Contact Privacy Team">
              <p className="privacy-section-text">
                If you have questions regarding this Privacy Policy or wish to exercise data authority rights, please contact our data protection team at{' '}
                <Link href="/contact" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  privacy@streetcraft.in
                </Link>{' '}
                or reach out via our direct founder support channels.
              </p>
            </PrivacySection>
          </div>
        </div>

        <PrivacyFooter />
      </div>
    </div>
  );
}
