import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../hooks/useBusiness';
import { BusinessProfile } from '../../types/business';
import { Store, Save, CheckCircle2, Clock, MapPin, Users, Sparkles } from 'lucide-react';

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
      <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        Loading persistent business memory...
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
    <div style={{ maxWidth: '900px' }}>
      <div className="section-header">
        <span className="section-eyebrow">PERSISTENT BUSINESS MEMORY &bull; POSTGRES REALTIME</span>
        <h1 className="section-title">Store Context & Voice</h1>
        <p className="section-subtitle">
          StreetCraft injects these exact parameters into every campaign pack. Updates synchronize instantly to the database.
        </p>
      </div>

      {savedSuccess && (
        <div style={{ padding: '16px 20px', background: 'var(--accent-emerald-subtle)', border: '1px solid var(--accent-emerald)', borderRadius: 'var(--radius-md)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-emerald)', fontWeight: 600 }}>
          <CheckCircle2 size={18} /> Business Memory updated and synchronized to PostgreSQL.
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        {/* Basic Identity */}
        <div style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Store size={16} color="var(--accent-emerald)" /> Business Identity
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Business / Shop Name</label>
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
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} color="var(--accent-indigo)" /> Neighborhood & Micro-Location
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
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="var(--accent-amber)" /> Audience, Signature Offerings & Tone
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
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--accent-rose)" /> Operational Hours & Revenue Windows
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="form-group">
              <label className="form-label">Slow Hours (Opportunities Target This)</label>
              <input
                type="text"
                className="form-input"
                value={formData.slowHours}
                onChange={(e) => setFormData({ ...formData, slowHours: e.target.value })}
                placeholder="e.g. 2:30 PM - 5:30 PM (Weekdays)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Baseline Offer</label>
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
              <label className="form-label">Store WhatsApp / Contact Phone</label>
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="submit" className="btn-primary" disabled={isSaving}>
            <Save size={16} /> {isSaving ? 'Saving to Database...' : 'Save Business Memory'}
          </button>
        </div>
      </form>
    </div>
  );
};
