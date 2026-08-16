import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../hooks/useBusiness';
import { BusinessProfile } from '../../types/business';
import { CheckCircle2 } from 'lucide-react';

interface BusinessPageProps {
  businessId: string;
}

export const BusinessPage: React.FC<BusinessPageProps> = ({ businessId }) => {
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
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--color-muted)' }}>
        Loading store memory...
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
    <div style={{ maxWidth: '780px' }}>
      <div className="section-header">
        <span className="section-eyebrow">PERSISTENT STORE CONTEXT &bull; REALTIME MEMORY</span>
        <h1 className="section-title">Store Profile & Tone</h1>
        <p className="section-subtitle">
          StreetCraft injects these exact parameters into every campaign proof. Updates synchronize directly to PostgreSQL.
        </p>
      </div>

      {savedSuccess && (
        <div style={{ padding: '14px 18px', background: 'var(--color-primary-faint)', border: '1px solid var(--color-primary)', borderRadius: 'var(--radius-xs)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-dark)', fontSize: '13.5px', fontWeight: 600 }}>
          <CheckCircle2 size={16} /> Store Memory updated and synchronized.
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        {/* Basic Identity */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '16px' }}>
            Store Identity
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Shop / Business Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. The Roasted Bean"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Artisanal Cafe & Bakery"
                required
              />
            </div>
          </div>
        </div>

        {/* Location & Neighborhood */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '16px' }}>
            Neighborhood & Landmarks
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Neighborhood / Area</label>
              <input
                type="text"
                className="form-input"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                placeholder="e.g. Indiranagar"
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
                placeholder="e.g. Bengaluru"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Landmarks / Street Cue (Crucial for Local Discovery)</label>
            <input
              type="text"
              className="form-input"
              value={formData.landmarks}
              onChange={(e) => setFormData({ ...formData, landmarks: e.target.value })}
              placeholder="e.g. Near 12th Main & Defense Colony Playground"
            />
          </div>
        </div>

        {/* Customer & Voice */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '16px' }}>
            Audience, Signature Offerings & Tone
          </h3>

          <div className="form-group">
            <label className="form-label">Target Customer Persona</label>
            <input
              type="text"
              className="form-input"
              value={formData.targetCustomer}
              onChange={(e) => setFormData({ ...formData, targetCustomer: e.target.value })}
              placeholder="e.g. Working professionals, freelancers, and weekend brunch crowds"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Signature Items / Best Sellers</label>
            <input
              type="text"
              className="form-input"
              value={formData.signatureItems}
              onChange={(e) => setFormData({ ...formData, signatureItems: e.target.value })}
              placeholder="e.g. Cinnamon Cold Brew, Sourdough Sandwiches, Single-Origin Pour-overs"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Brand Voice & Style Guide</label>
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
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', marginBottom: '16px' }}>
            Operating Hours & Default Offer
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Slow Hours (Promotions Target This)</label>
              <input
                type="text"
                className="form-input"
                value={formData.slowHours}
                onChange={(e) => setFormData({ ...formData, slowHours: e.target.value })}
                placeholder="e.g. 2:30 PM - 5:30 PM (Weekdays)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Counter Offer</label>
              <input
                type="text"
                className="form-input"
                value={formData.defaultOffer}
                onChange={(e) => setFormData({ ...formData, defaultOffer: e.target.value })}
                placeholder="e.g. 20% off pour-overs & bakes"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Average Ticket Size (INR)</label>
              <input
                type="number"
                className="form-input"
                value={formData.avgTicketINR}
                onChange={(e) => setFormData({ ...formData, avgTicketINR: parseInt(e.target.value, 10) || 0 })}
                placeholder="350"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Store WhatsApp Phone</label>
              <input
                type="text"
                className="form-input"
                value={formData.phoneWhatsApp}
                onChange={(e) => setFormData({ ...formData, phoneWhatsApp: e.target.value })}
                placeholder="+91 98450 12345"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-editorial)' }}>
          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Store Memory'}
          </button>
        </div>
      </form>
    </div>
  );
};
