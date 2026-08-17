import React, { useState } from 'react';
import { Mail, MessageCircle, ArrowRight, Check } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [storeName, setStoreName] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // High-trust mailto fallback or simple acknowledgement
    const mailto = `mailto:founder@streetcraft.in?subject=${encodeURIComponent(`StreetCraft Inquiry: ${storeName || name}`)}&body=${encodeURIComponent(`Name: ${name}\nStore: ${storeName}\nEmail: ${email}\n\nMessage:\n${message}`)}`;
    window.location.href = mailto;
    setSent(true);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 24px 96px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="section-eyebrow">FOUNDER SUPPORT &bull; GET IN TOUCH</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', color: 'var(--color-ink)', marginTop: '6px' }}>
          Talk to us
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--color-ink-muted)', marginTop: '8px', maxWidth: '520px', margin: '8px auto 0', lineHeight: '1.5' }}>
          Questions about StreetCraft, your store, or getting started? We're here.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Contact Form */}
        <div className="card" style={{ padding: '32px' }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '8px' }}>
                Opening your email client...
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>
                If your email client didn't open automatically, you can write directly to <strong style={{ color: 'var(--color-ink)' }}>founder@streetcraft.in</strong>.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Sharma"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Business / Store Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Blue Door Cafe"
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
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

              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label className="form-label">How can we help?</label>
                <textarea
                  rows={4}
                  required
                  className="form-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your store or what you'd like to ask..."
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Send Message &rarr;
              </button>
            </form>
          )}
        </div>

        {/* Direct Channels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Mail size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>Email Founder Direct</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginBottom: '12px', lineHeight: '1.5' }}>
              Direct email for operator onboarding, beta access, or technical questions.
            </p>
            <a
              href="mailto:founder@streetcraft.in"
              style={{ fontSize: '13.5px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
            >
              founder@streetcraft.in &rarr;
            </a>
          </div>

          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <MessageCircle size={18} color="var(--color-accent)" />
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-ink)' }}>WhatsApp Help</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginBottom: '12px', lineHeight: '1.5' }}>
              Fast response for physical business operators during business hours.
            </p>
            <a
              href="https://wa.me/919876543210?text=Hi%20StreetCraft%20team,%20I%20have%20a%20question%20about%20my%20store"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '13.5px', color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}
            >
              Message on WhatsApp &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
