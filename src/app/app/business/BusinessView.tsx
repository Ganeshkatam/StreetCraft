'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useBusiness } from '../../../hooks/useBusiness';
import { BusinessProfile } from '../../../types/business';
import { CheckCircle2, Save } from 'lucide-react';

export function BusinessView() {
  const { session } = useAuth();
  const businessId = session.activeBusinessId || '';

  const { profile, loading, updateProfile } = useBusiness(businessId);
  const [formData, setFormData] = useState<BusinessProfile | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  if (loading || !formData) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-ink-muted)' }}>
        Loading store preferences...
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
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

      {savedSuccess && (
        <div style={{ padding: '14px 18px', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-xs)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)', fontSize: '13.5px', fontWeight: 600 }}>
          <CheckCircle2 size={16} /> Business details saved successfully.
        </div>
      )}

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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="The name customers know you by"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">What kind of place is it?</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                  value={formData.neighborhood}
                  onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                  placeholder="e.g. Indiranagar, Bandra"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                value={formData.landmarks}
                onChange={(e) => setFormData({ ...formData, landmarks: e.target.value })}
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
                value={formData.signatureItems}
                onChange={(e) => setFormData({ ...formData, signatureItems: e.target.value })}
                placeholder="Your best products, dishes, or specialties"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Who are your typical customers?</label>
              <input
                type="text"
                className="form-input"
                value={formData.targetCustomer}
                onChange={(e) => setFormData({ ...formData, targetCustomer: e.target.value })}
                placeholder="e.g. Neighborhood residents, working professionals, weekend brunchers"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tone & Brand Voice</label>
              <input
                type="text"
                className="form-input"
                value={formData.styleVoice}
                onChange={(e) => setFormData({ ...formData, styleVoice: e.target.value })}
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
                  value={formData.slowHours}
                  onChange={(e) => setFormData({ ...formData, slowHours: e.target.value })}
                  placeholder="e.g. Monday–Thursday, 3:00 PM – 6:00 PM"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default Counter Offer / Special</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.defaultOffer}
                  onChange={(e) => setFormData({ ...formData, defaultOffer: e.target.value })}
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
                  value={formData.avgTicketINR}
                  onChange={(e) => setFormData({ ...formData, avgTicketINR: parseInt(e.target.value, 10) || 0 })}
                  placeholder="350"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Store WhatsApp or Phone</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.phoneWhatsApp}
                  onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
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
            {formData.name || 'Your Store'}
          </h4>
          <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '16px' }}>
            {formData.neighborhood || 'Neighborhood'}, {formData.city || 'City'}
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--color-ink)', lineHeight: '1.6', background: 'var(--color-surface)', padding: '14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)', marginBottom: '14px' }}>
            <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '4px' }}>SIGNATURE ITEMS</div>
            {formData.signatureItems || 'Signature roasts, fresh bakery bakes'}
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--color-ink)', lineHeight: '1.6', background: 'var(--color-surface)', padding: '14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink-muted)', marginBottom: '4px' }}>TARGET WINDOW</div>
            {formData.slowHours || 'Weekday afternoons'}
          </div>
        </div>
      </div>
    </div>
  );
}
