'use client';

import React, { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { createStoreAction, CreateStoreActionState } from '../../../lib/server/new-store/createStoreAction';
import { Store, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const initialCreateState: CreateStoreActionState = { success: false };

const BUSINESS_CATEGORIES = [
  'Bakery & Pastry',
  'Cafe & Coffee Bar',
  'Restaurant & Dining',
  'Retail & Boutique',
  'Sweets & Mithai',
  'Grocery & Gourmet',
  'Salon & Personal Care',
  'Fitness & Wellness',
  'Bookstore & Stationery',
  'Other Local Business',
];

interface NewStoreViewProps {
  claimToken?: string;
}

export function NewStoreView({ claimToken }: NewStoreViewProps) {
  const [state, formAction, isPending] = useActionState(createStoreAction, initialCreateState);

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="setup-workspace-wrapper setup-bg-new-store">
      <div className="setup-backdrop-overlay" />
      <div className="setup-workspace-container" style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ marginBottom: '20px' }}>
          <Link
            href="/user/today"
            className="btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <ArrowLeft size={14} />
            <span>Back to Workspace</span>
          </Link>
        </div>

        <div className="setup-editor-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '18px', borderBottom: '1px solid var(--color-border)' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Store size={22} />
            </div>

            <div>
              <span className="setup-eyebrow" style={{ display: 'block', fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--color-primary)', textTransform: 'uppercase', marginBottom: '2px' }}>
                NEW STOREFRONT
              </span>
              <h1 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-ink)', margin: 0 }}>
                Create Storefront
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', margin: '3px 0 0' }}>
                Enter the name and category to initialize your storefront entity and begin configuration.
              </p>
            </div>
          </div>

          <form action={formAction}>
            {claimToken && <input type="hidden" name="claimToken" value={claimToken} />}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="name">
                Storefront Name <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="input-field"
                placeholder="e.g. Saffron Street Artisanal Cafe"
                required
                disabled={isPending}
                autoFocus
              />
              {state.errors?.name && (
                <span className="field-error">{state.errors.name[0]}</span>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '28px' }}>
              <label className="form-label" htmlFor="category">
                Storefront Category <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <select
                id="category"
                name="category"
                className="input-field select-field"
                defaultValue="Cafe & Coffee Bar"
                required
                disabled={isPending}
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {state.errors?.category && (
                <span className="field-error">{state.errors.category[0]}</span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingTop: '18px', borderTop: '1px solid var(--color-border)' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={isPending}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 22px', fontSize: '13.5px' }}
              >
                {isPending ? (
                  <>
                    <Loader2 size={15} className="spin" />
                    <span>Creating Storefront...</span>
                  </>
                ) : (
                  <>
                    <span>Create Storefront &amp; Continue Setup</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
