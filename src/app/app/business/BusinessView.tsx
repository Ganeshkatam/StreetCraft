'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { useBusiness } from '../../../hooks/useBusiness';
import { api } from '../../../lib/api';
import { BusinessProfile } from '../../../types/business';
import { getUserFacingErrorMessage } from '../../../lib/userFacingError';
import { toast } from 'sonner';
import { Save, Store, Plus } from 'lucide-react';

export function BusinessView() {
  const router = useRouter();
  const { session, createBusiness } = useAuth();
  const businessId = session.activeBusinessId || '';

  const { profile, loading, updateProfile } = useBusiness(businessId);
  const [formData, setFormData] = useState<BusinessProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '32px var(--space-gutter) 80px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-ink-muted)' }}>
          Loading business profile...
        </div>
      </div>
    );
  }

  // Zero-store state: Do not render empty forms if user has no store
  if (!businessId || !profile) {
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

  const currentData: BusinessProfile = formData || profile || api._getEmptyProfile(businessId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!businessId) {
        const newSess = await createBusiness(
          currentData.name || 'My Store',
          currentData.category || 'Café & Bakery',
          currentData.neighborhood || '',
          currentData.city || '',
          currentData.phoneWhatsApp || ''
        );
        if (newSess.activeBusinessId) {
          await updateProfile({ ...currentData, businessId: newSess.activeBusinessId });
        }
      } else {
        await updateProfile(currentData);
      }
      toast.success('Business profile updated successfully.');
    } catch (err: unknown) {
      toast.error(getUserFacingErrorMessage(err, 'Failed to update business profile. Please try again.'));
    } finally {
      setIsSaving(false);
    }
  };

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
        <form onSubmit={handleSubmit} className="card">
          {/* Basic Identity */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', marginBottom: '16px' }}>
              Business Identity
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">What is your business called?</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentData.name}
                  onChange={(e) => setFormData({ ...currentData, name: e.target.value })}
                  placeholder="The name customers know you by"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">What kind of place is it?</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentData.category}
                  onChange={(e) => setFormData({ ...currentData, category: e.target.value })}
                  placeholder="e.g. Café & Bakery, Restaurant, Boutique"
                  required
                />
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
                <label className="form-label">Area / Neighborhood</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentData.neighborhood}
                  onChange={(e) => setFormData({ ...currentData, neighborhood: e.target.value })}
                  placeholder="e.g. Indiranagar, Bandra"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentData.city}
                  onChange={(e) => setFormData({ ...currentData, city: e.target.value })}
                  placeholder="e.g. Bengaluru, Mumbai"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Landmark or Street Cue</label>
              <input
                type="text"
                className="form-input"
                value={currentData.landmarks}
                onChange={(e) => setFormData({ ...currentData, landmarks: e.target.value })}
                placeholder="e.g. Near 12th Main junction, opposite the park"
              />
            </div>
          </div>

          {/* Customer & Voice */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', marginBottom: '16px' }}>
              Products & Specialties
            </h3>

            <div className="form-group">
              <label className="form-label">What should customers remember you for?</label>
              <input
                type="text"
                className="form-input"
                value={currentData.signatureItems}
                onChange={(e) => setFormData({ ...currentData, signatureItems: e.target.value })}
                placeholder="Your best products, dishes, or specialties"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Who are your typical customers?</label>
              <input
                type="text"
                className="form-input"
                value={currentData.targetCustomer}
                onChange={(e) => setFormData({ ...currentData, targetCustomer: e.target.value })}
                placeholder="e.g. Neighborhood residents, working professionals, weekend brunchers"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tone & Brand Voice</label>
              <input
                type="text"
                className="form-input"
                value={currentData.styleVoice}
                onChange={(e) => setFormData({ ...currentData, styleVoice: e.target.value })}
                placeholder="e.g. Warm, contemporary, artisanal yet unpretentious"
              />
            </div>
          </div>

          {/* Operational Rhythm */}
          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', marginBottom: '16px' }}>
              Operating Rhythm & Counter Contact
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div className="form-group">
                <label className="form-label">When does the business get quiet?</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentData.slowHours}
                  onChange={(e) => setFormData({ ...currentData, slowHours: e.target.value })}
                  placeholder="e.g. Monday–Thursday, 3:00 PM – 6:00 PM"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default Counter Offer / Special</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentData.defaultOffer}
                  onChange={(e) => setFormData({ ...currentData, defaultOffer: e.target.value })}
                  placeholder="e.g. 20% off pour-overs & fresh bakes"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Average Customer Spend (INR)</label>
                <input
                  type="number"
                  className="form-input"
                  value={currentData.avgTicketINR || ''}
                  onChange={(e) => setFormData({ ...currentData, avgTicketINR: parseInt(e.target.value, 10) || 0 })}
                  placeholder="350"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Store WhatsApp or Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={currentData.phoneWhatsApp}
                  onChange={(e) => setFormData({ ...currentData, phoneWhatsApp: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              <Save size={14} /> {isSaving ? 'Saving...' : 'Save Store Preferences'}
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
            {currentData.signatureItems || 'Not specified yet'}
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--color-ink)', lineHeight: '1.6', background: 'var(--color-surface)', padding: '14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '4px' }}>TARGET WINDOW</div>
            {currentData.slowHours || 'Not specified yet'}
          </div>
        </div>
      </div>
    </div>
  );
}
