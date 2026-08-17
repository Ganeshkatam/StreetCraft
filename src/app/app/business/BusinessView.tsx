'use client';

import React, { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Store, Plus, Save } from 'lucide-react';
import { updateBusinessProfile, ActionState } from '../../../lib/server/business/updateBusinessProfile';
import { WorkspaceTodayViewModel } from '../../../lib/server/workspace/getWorkspaceTodayData';
import { toast } from 'sonner';

export function BusinessView({ initialData }: { initialData: WorkspaceTodayViewModel | null }) {
  const router = useRouter();
  
  // React 19 Action State
  const boundAction = updateBusinessProfile.bind(null, initialData?.business.id);
  const [state, formAction, isPending] = useActionState(boundAction, { success: false } as ActionState);

  useEffect(() => {
    if (state.message && state.success) {
      toast.success(state.message);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  // Zero-store state: Do not render empty forms if user has no store
  if (!initialData) {
    return (
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
        <div className="section-header">
          <span className="section-eyebrow">STORE PROFILE &bull; BUSINESS CONTEXT</span>
          <h1 className="section-title">Business Profile</h1>
          <p className="section-subtitle">
            StreetCraft uses these details to shape every campaign. Updates apply immediately across your workspace.
          </p>
        </div>

        <div className="card" style={{ maxWidth: '560px', margin: '40px auto', textAlign: 'center', padding: '48px 36px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Store size={26} />
          </div>
          <h2 style={{ fontSize: '22px', fontFamily: 'var(--font-display)', marginBottom: '8px', color: 'var(--color-ink)' }}>
            No Storefront Configured
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
            You have not set up a store profile yet. Complete the quick onboarding setup to configure your store identity, neighborhood, and operating rhythm.
          </p>
          <button
            onClick={() => router.push('/setup')}
            className="btn-primary"
            style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            Set Up Your Storefront
          </button>
        </div>
      </div>
    );
  }

  const { profile } = initialData;
  const currentData = profile || {} as any; // Fallback if no profile row exists, which shouldn't happen with proper onboarding
  const errors = state.errors || {};

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
      <div className="section-header">
        <span className="section-eyebrow">STORE PROFILE &bull; BUSINESS CONTEXT</span>
        <h1 className="section-title">Business Profile</h1>
        <p className="section-subtitle">
          StreetCraft uses these details to shape every campaign. Updates apply immediately across your workspace.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
        <form action={formAction} className="card">
          {/* Basic Identity */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', marginBottom: '16px' }}>
              Business Identity
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">What is your business called?</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  defaultValue={currentData.name || ''}
                  placeholder="The name customers know you by"
                  required
                />
                {errors.name && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.name[0]}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="category">What kind of place is it?</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  className="form-input"
                  defaultValue={currentData.category || ''}
                  placeholder="e.g. Café & Bakery, Restaurant, Boutique"
                  required
                />
                {errors.category && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.category[0]}</div>}
              </div>
            </div>
          </div>

          {/* Location & Neighborhood */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', marginBottom: '16px' }}>
              Where Customers Find You
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="neighborhood">Area / Neighborhood</label>
                <input
                  type="text"
                  id="neighborhood"
                  name="neighborhood"
                  className="form-input"
                  defaultValue={currentData.neighborhood || ''}
                  placeholder="e.g. Indiranagar, Bandra"
                />
                {errors.neighborhood && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.neighborhood[0]}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="form-input"
                  defaultValue={currentData.city || ''}
                  placeholder="e.g. Bengaluru, Mumbai"
                />
                {errors.city && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.city[0]}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="landmarks">Landmark or Street Cue</label>
              <input
                type="text"
                id="landmarks"
                name="landmarks"
                className="form-input"
                defaultValue={currentData.landmarks || ''}
                placeholder="e.g. Near 12th Main junction, opposite the park"
              />
              {errors.landmarks && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.landmarks[0]}</div>}
            </div>
          </div>

          {/* Customer & Voice */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', marginBottom: '16px' }}>
              Products & Specialties
            </h3>

            <div className="form-group">
              <label className="form-label" htmlFor="signature_items">What should customers remember you for?</label>
              <input
                type="text"
                id="signature_items"
                name="signature_items"
                className="form-input"
                defaultValue={currentData.signature_items || ''}
                placeholder="Your best products, dishes, or specialties"
              />
              {errors.signature_items && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.signature_items[0]}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="target_customer">Who are your typical customers?</label>
              <input
                type="text"
                id="target_customer"
                name="target_customer"
                className="form-input"
                defaultValue={currentData.target_customer || ''}
                placeholder="e.g. Neighborhood residents, working professionals, weekend brunchers"
              />
              {errors.target_customer && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.target_customer[0]}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="style_voice">Tone & Brand Voice</label>
              <input
                type="text"
                id="style_voice"
                name="style_voice"
                className="form-input"
                defaultValue={currentData.style_voice || ''}
                placeholder="e.g. Warm, contemporary, artisanal yet unpretentious"
              />
              {errors.style_voice && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.style_voice[0]}</div>}
            </div>
          </div>

          {/* Operational Rhythm */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', marginBottom: '16px' }}>
              Operating Rhythm & Counter Contact
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="slow_hours">When does the business get quiet?</label>
                <input
                  type="text"
                  id="slow_hours"
                  name="slow_hours"
                  className="form-input"
                  defaultValue={currentData.slow_hours || ''}
                  placeholder="e.g. Monday–Thursday, 3:00 PM – 6:00 PM"
                />
                {errors.slow_hours && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.slow_hours[0]}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="default_offer">Default Counter Offer / Special</label>
                <input
                  type="text"
                  id="default_offer"
                  name="default_offer"
                  className="form-input"
                  defaultValue={currentData.default_offer || ''}
                  placeholder="e.g. 20% off pour-overs & fresh bakes"
                />
                {errors.default_offer && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.default_offer[0]}</div>}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="avg_ticket_inr">Average Customer Spend (INR)</label>
                <input
                  type="number"
                  id="avg_ticket_inr"
                  name="avg_ticket_inr"
                  className="form-input"
                  defaultValue={currentData.avg_ticket_inr || ''}
                  placeholder="350"
                  min="0"
                />
                {errors.avg_ticket_inr && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.avg_ticket_inr[0]}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone_whatsapp">Store WhatsApp or Phone</label>
                <input
                  type="text"
                  id="phone_whatsapp"
                  name="phone_whatsapp"
                  className="form-input"
                  defaultValue={currentData.phone_whatsapp || ''}
                  placeholder="+91 98765 43210"
                />
                {errors.phone_whatsapp && <div style={{ color: 'var(--color-danger)', fontSize: '12px', marginTop: '4px' }}>{errors.phone_whatsapp[0]}</div>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            <button type="submit" className="btn-primary" disabled={isPending}>
              <Save size={14} /> {isPending ? 'Saving...' : 'Save Store Preferences'}
            </button>
          </div>
        </form>

        {/* Right Column */}
        <div className="card" style={{ background: 'var(--color-surface-raised)' }}>
          <span className="section-eyebrow">PREFERENCES CARD</span>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', marginTop: '4px' }}>
            {currentData.name || 'Store Name Not Set'}
          </h4>
          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '16px' }}>
            {currentData.neighborhood ? (currentData.city ? `${currentData.neighborhood}, ${currentData.city}` : currentData.neighborhood) : 'Location not set'}
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--color-ink)', lineHeight: '1.6', background: 'var(--color-surface)', padding: '14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', marginBottom: '14px' }}>
            <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '4px' }}>SIGNATURE ITEMS</div>
            {currentData.signature_items || 'Not specified yet'}
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--color-ink)', lineHeight: '1.6', background: 'var(--color-surface)', padding: '14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '4px' }}>TARGET WINDOW</div>
            {currentData.slow_hours || 'Not specified yet'}
          </div>
        </div>
      </div>
    </div>
  );
}
