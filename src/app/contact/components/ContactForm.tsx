'use client';

import React, { useActionState, useState } from 'react';
import { submitContactAction } from '../../../lib/server/contact/submitContactAction';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import type { ContactCategory } from '../../../lib/domain/contact/contactSchema';

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactAction, null);
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory>('SUPPORT');

  if (state?.success) {
    return (
      <div
        className="card"
        style={{
          padding: '48px 36px',
          textAlign: 'center',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--color-primary-subtle)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <CheckCircle2 size={28} />
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            color: 'var(--color-ink)',
            marginBottom: '10px',
          }}
        >
          Inquiry Received
        </h3>

        <p
          style={{
            fontSize: '15px',
            color: 'var(--color-ink-muted)',
            lineHeight: '1.6',
            maxWidth: '440px',
            margin: '0 auto 28px',
          }}
        >
          {state.message}
        </p>

        <button
          type="button"
          className="btn-secondary"
          onClick={() => window.location.reload()}
          style={{ padding: '10px 24px', fontSize: '13.5px' }}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        padding: '36px',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', margin: '0 0 6px' }}>
          Send a Message
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', margin: 0 }}>
          Fill in your details below and our team will get back to you directly.
        </p>
      </div>

      {state?.generalError && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#991B1B',
            fontSize: '13.5px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{state.generalError}</span>
        </div>
      )}

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Category Radio / Selector */}
        <div>
          <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '13px', fontWeight: 600 }}>
            Inquiry Category
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {(
              [
                { id: 'SUPPORT', label: 'Product Support' },
                { id: 'BILLING', label: 'Billing & Quotas' },
                { id: 'PARTNERSHIPS', label: 'Partnerships' },
                { id: 'GENERAL', label: 'General Questions' },
              ] as const
            ).map((cat) => (
              <label
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${selectedCategory === cat.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: selectedCategory === cat.id ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                  fontSize: '13px',
                  fontWeight: selectedCategory === cat.id ? 600 : 500,
                  color: selectedCategory === cat.id ? 'var(--color-primary)' : 'var(--color-ink)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.id}
                  checked={selectedCategory === cat.id}
                  onChange={() => setSelectedCategory(cat.id)}
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <span>{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Name and Email */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label htmlFor="name" className="form-label" style={{ marginBottom: '6px', display: 'block', fontSize: '13px', fontWeight: 600 }}>
              Your Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="form-input"
              placeholder="e.g. Priya Sharma"
              disabled={isPending}
            />
            {state?.fieldErrors?.name && (
              <span style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                {state.fieldErrors.name[0]}
              </span>
            )}
          </div>

          <div>
            <label htmlFor="email" className="form-label" style={{ marginBottom: '6px', display: 'block', fontSize: '13px', fontWeight: 600 }}>
              Email Address *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="form-input"
              placeholder="you@yourstore.com"
              disabled={isPending}
            />
            {state?.fieldErrors?.email && (
              <span style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                {state.fieldErrors.email[0]}
              </span>
            )}
          </div>
        </div>

        {/* Store Name and Subject */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label htmlFor="storeName" className="form-label" style={{ marginBottom: '6px', display: 'block', fontSize: '13px', fontWeight: 600 }}>
              Storefront / Business Name
            </label>
            <input
              id="storeName"
              name="storeName"
              type="text"
              className="form-input"
              placeholder="e.g. Blue Door Cafe"
              disabled={isPending}
            />
          </div>

          <div>
            <label htmlFor="subject" className="form-label" style={{ marginBottom: '6px', display: 'block', fontSize: '13px', fontWeight: 600 }}>
              Subject *
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              required
              className="form-input"
              placeholder="Brief summary of inquiry"
              disabled={isPending}
            />
            {state?.fieldErrors?.subject && (
              <span style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                {state.fieldErrors.subject[0]}
              </span>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="form-label" style={{ marginBottom: '6px', display: 'block', fontSize: '13px', fontWeight: 600 }}>
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="form-input"
            placeholder="Tell us about your store, what you are trying to promote, or any specific questions..."
            disabled={isPending}
          />
          {state?.fieldErrors?.message && (
            <span style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', display: 'block' }}>
              {state.fieldErrors.message[0]}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={isPending}
          style={{
            padding: '13px 24px',
            fontSize: '14.5px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.7 : 1,
          }}
        >
          <Send size={15} />
          <span>{isPending ? 'Sending...' : 'Send Message'}</span>
        </button>
      </form>
    </div>
  );
}
