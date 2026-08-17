'use client';

import React, { useState } from 'react';
import { PublicHeader } from '../components/PublicHeader';
import { ServerFooter } from '../components/ServerFooter';
import { Mail, MessageCircle, Check } from 'lucide-react';

export function ContactView() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mailto = `mailto:founder@streetcraft.in?subject=${encodeURIComponent(`StreetCraft Inquiry: ${storeName || name}`)}&body=${encodeURIComponent(`Name: ${name}\nStore: ${storeName}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    window.location.href = mailto;
    setSent(true);
  };

  return (
    <>
      <PublicHeader />

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px var(--space-gutter) 96px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-eyebrow">FOUNDER SUPPORT &bull; GET IN TOUCH</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', color: 'var(--color-ink)', marginTop: '6px' }}>
            Talk to us
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--color-ink-muted)', marginTop: '8px', maxWidth: '520px', margin: '8px auto 0', lineHeight: '1.5' }}>
            Questions about StreetCraft, your store, or getting started? We&apos;re here.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' }}>
          <div className="card" style={{ padding: '32px' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Check size={24} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '8px' }}>
                  Message Ready
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>
                  Your email client has been opened. If it didn&apos;t open, email us directly at <strong>founder@streetcraft.in</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Your Store / Business Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="e.g. Blue Door Cafe"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourstore.com"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">How can we help?</label>
                  <textarea
                    rows={4}
                    required
                    className="form-input"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your store, what you're trying to promote, or any questions..."
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '14px' }}>
                  Send Message
                </button>
              </form>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Mail size={18} color="var(--color-primary)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>
                  Email the Founder Directly
                </h3>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5', margin: '0 0 12px' }}>
                We respond within 24 hours to all storefront operators.
              </p>
              <a
                href="mailto:founder@streetcraft.in"
                style={{ fontSize: '13.5px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
              >
                founder@streetcraft.in
              </a>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <MessageCircle size={18} color="var(--color-accent)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>
                  WhatsApp Priority Desk
                </h3>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5', margin: '0 0 12px' }}>
                Direct WhatsApp assistance for active store onboarding.
              </p>
              <a
                href="https://wa.me/919876543210?text=Hi%20StreetCraft%20Team%2C%20I%20have%20a%20question%20about%20my%20store"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '13.5px', color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}
              >
                Message on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>

      <ServerFooter variant="full" />
    </>
  );
}
