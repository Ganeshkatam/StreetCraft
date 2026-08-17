import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { getUserFacingErrorMessage } from '../lib/userFacingError';
import { toast } from 'sonner';
import {
  Store,
  ShieldCheck,
  Check
} from 'lucide-react';
import { CustomSelect } from '../components/CustomSelect';
import { STORE_CATEGORIES } from '../config/categories';

interface OnboardingPageProps {
  claimToken?: string | null;
  onSuccess?: () => void;
}

export const OnboardingPage: React.FC<OnboardingPageProps> = ({ claimToken, onSuccess }) => {
  const navigate = useNavigate();
  const { createBusiness, signOut } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [storeName, setStoreName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [landmarks, setLandmarks] = useState('');
  const [category, setCategory] = useState('');
  const [signatureItems, setSignatureItems] = useState('');
  const [targetCustomer, setTargetCustomer] = useState('');
  const [slowHours, setSlowHours] = useState('');
  const [defaultOffer, setDefaultOffer] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !neighborhood || !category || !city) return;
    toast.success('Store identity saved.');
    setStep(2);
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const activeSession = await createBusiness(storeName, category, neighborhood, city, phone);

      if (activeSession.activeBusinessId) {
        await api.updateBusinessProfile(activeSession.activeBusinessId, {
          businessId: activeSession.activeBusinessId,
          name: storeName,
          category,
          neighborhood,
          city,
          landmarks,
          targetCustomer,
          styleVoice: '',
          signatureItems,
          primaryGoal: '',
          peakHours: '',
          slowHours,
          defaultOffer,
          avgTicketINR: 0,
          phoneWhatsApp: phone,
          updatedAt: new Date().toISOString(),
          targetMonthlyCustomers: 0,
        });

        if (claimToken) {
          await api.claimAnonymousCampaign(claimToken, activeSession.activeBusinessId);
        }
      }

      toast.success('Store operating rhythm saved.');
      if (onSuccess) onSuccess();
      setStep(3);
    } catch (err: unknown) {
      toast.error(getUserFacingErrorMessage(err, 'Failed to save store profile. Please review your details and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="auth-full-viewport"
      style={{ backgroundImage: "url('/setup_full.jpg')" }}
    >
      <div className="auth-backdrop-overlay" />

      <div className="auth-content-container">
        <header className="auth-header">
          <div className="auth-brand-badge">
            <div className="auth-logo-badge">
              <Store size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="auth-logo-title">STREETCRAFT</div>
              <div className="auth-logo-subtitle">STORE SETUP ONBOARDING</div>
            </div>
          </div>

          <button
            className="auth-back-btn"
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
          >
            Sign out
          </button>
        </header>

        <main className="auth-main-grid">
          <div className="auth-hero-col">
            <h1 className="auth-hero-title">
              Teach StreetCraft<br />
              <span className="auth-hero-italic">about your store.</span>
            </h1>

            <p className="auth-hero-subtitle">
              StreetCraft uses your location, rhythm, and signature items to generate promotions that feel authentic to your counter.
            </p>

            <div className="auth-value-props">
              <div className={`auth-step-pill ${step === 1 ? 'active' : ''}`}>
                <div className={`auth-step-num ${step > 1 ? 'done' : step === 1 ? 'active' : ''}`}>
                  {step > 1 ? <Check size={14} /> : '1'}
                </div>
                <div>
                  <div className="auth-value-title">Store Identity & Location</div>
                  <div className="auth-value-desc">Name, category, neighborhood, and city</div>
                </div>
              </div>

              <div className={`auth-step-pill ${step === 2 ? 'active' : ''}`}>
                <div className={`auth-step-num ${step === 3 ? 'done' : step === 2 ? 'active' : ''}`}>
                  {step === 3 ? <Check size={14} /> : '2'}
                </div>
                <div>
                  <div className="auth-value-title">Operating Rhythm & Offers</div>
                  <div className="auth-value-desc">Signature items, slump hours & contact</div>
                </div>
              </div>

              {/* Dynamic Step-Based Guidance Card */}
              {step === 1 && (
                <div
                  className="auth-value-item"
                  style={{
                    flexDirection: 'column',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.94)',
                    border: '1px solid rgba(255, 255, 255, 0.95)',
                    padding: '16px 18px',
                  }}
                >
                  <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    STEP 1 FOCUS: LOCAL DISCOVERY
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
                    Why your location &amp; category matter
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', lineHeight: '1.45' }}>
                    StreetCraft uses your exact neighborhood and category to tailor search keywords, Google Business updates, and local geotagging so nearby customers discover you first.
                  </div>
                </div>
              )}

              {step === 2 && (
                <div
                  className="auth-value-item"
                  style={{
                    flexDirection: 'column',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.94)',
                    border: '1px solid rgba(255, 255, 255, 0.95)',
                    padding: '16px 18px',
                  }}
                >
                  <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    STEP 2 FOCUS: COUNTER RHYTHM
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
                    Turn quiet hours into walk-in revenue
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', lineHeight: '1.45' }}>
                    Your signature specialties and slump hours power timely afternoon specials, flash deals, and WhatsApp broadcasts timed right before your quiet hours start.
                  </div>
                </div>
              )}

              {step === 3 && (
                <div
                  className="auth-value-item"
                  style={{
                    flexDirection: 'column',
                    gap: '6px',
                    background: 'rgba(255, 255, 255, 0.94)',
                    border: '1px solid rgba(255, 255, 255, 0.95)',
                    padding: '16px 18px',
                  }}
                >
                  <div style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    STEP 3 FOCUS: WORKSPACE LAUNCH
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
                    Ready to compose your first campaign
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', lineHeight: '1.45' }}>
                    Your store identity and rhythm are now active. Head into the campaign studio to generate promotional copy and multi-channel campaign assets.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="auth-card-col">
            <div className="auth-card">
              {step === 1 && (
                <div>
                  <span className="section-eyebrow">STEP 1 OF 2 &bull; BUSINESS IDENTITY</span>
                  <h2 className="auth-card-title">Tell us about your business</h2>

                  <form onSubmit={handleStep1Submit}>
                    <div className="auth-form-field">
                      <label className="auth-form-label">What is your business called?</label>
                      <input
                        type="text"
                        required
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="The name customers know you by"
                        className="form-input"
                      />
                    </div>

                    <div className="auth-form-field">
                      <label className="auth-form-label">What kind of place is it?</label>
                      <CustomSelect
                        value={category}
                        onChange={(val) => setCategory(val)}
                        options={STORE_CATEGORIES}
                        placeholder="Select your business category..."
                      />
                    </div>

                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                      <div>
                        <label className="auth-form-label">Area / Neighborhood</label>
                        <input
                          type="text"
                          required
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          placeholder="e.g. Indiranagar, Bandra"
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="auth-form-label">City</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Bengaluru, Mumbai"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="auth-form-field" style={{ marginBottom: '20px' }}>
                      <label className="auth-form-label">Landmark or Street Cue (optional)</label>
                      <input
                        type="text"
                        value={landmarks}
                        onChange={(e) => setLandmarks(e.target.value)}
                        placeholder="e.g. Near 12th Main junction, opposite the park"
                        className="form-input"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!storeName || !neighborhood || !category || !city || isSubmitting}
                      className="auth-submit-btn"
                    >
                      {isSubmitting ? 'Saving store...' : 'Save & Continue'}
                    </button>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div>
                  <span className="section-eyebrow">STEP 2 OF 2 &bull; OPERATING RHYTHM</span>
                  <h2 className="auth-card-title">What shapes your campaigns</h2>

                  <form onSubmit={handleCompleteSetup}>
                    <div className="auth-form-field">
                      <label className="auth-form-label">What should customers remember you for?</label>
                      <input
                        type="text"
                        value={signatureItems}
                        onChange={(e) => setSignatureItems(e.target.value)}
                        placeholder="Your best products, dishes, or specialties"
                        className="form-input"
                      />
                    </div>

                    <div className="auth-form-field">
                      <label className="auth-form-label">Who are your typical customers?</label>
                      <input
                        type="text"
                        value={targetCustomer}
                        onChange={(e) => setTargetCustomer(e.target.value)}
                        placeholder="e.g. Neighborhood residents, working professionals, weekend brunchers"
                        className="form-input"
                      />
                    </div>

                    <div className="auth-form-field">
                      <label className="auth-form-label">When does the business usually get quiet?</label>
                      <input
                        type="text"
                        value={slowHours}
                        onChange={(e) => setSlowHours(e.target.value)}
                        placeholder="e.g. Monday–Thursday, 3:00 PM – 6:00 PM"
                        className="form-input"
                      />
                    </div>

                    <div className="auth-form-field">
                      <label className="auth-form-label">Default Counter Offer / Special</label>
                      <input
                        type="text"
                        value={defaultOffer}
                        onChange={(e) => setDefaultOffer(e.target.value)}
                        placeholder="e.g. 20% off pour-overs & fresh bakes"
                        className="form-input"
                      />
                    </div>

                    <div className="auth-form-field" style={{ marginBottom: '20px' }}>
                      <label className="auth-form-label">Store WhatsApp or counter phone (optional)</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="form-input"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="btn-secondary"
                        style={{ padding: '10px 16px', fontSize: '13px' }}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="auth-submit-btn"
                        style={{ flex: 1 }}
                      >
                        {isSubmitting ? 'Saving preferences...' : 'Launch Workspace'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {step === 3 && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div className="auth-value-icon" style={{ width: '48px', height: '48px', margin: '0 auto 14px', borderRadius: '50%' }}>
                    <Check size={26} strokeWidth={2.5} />
                  </div>
                  <h2 className="auth-card-title">Store Workspace Ready</h2>
                  <p className="auth-card-subtitle" style={{ margin: '0 0 20px' }}>
                    {storeName || 'Your store'} has been configured and saved. Let&apos;s create your first campaign.
                  </p>
                  <button
                    onClick={() => navigate('/app/create')}
                    className="auth-submit-btn"
                  >
                    Open Campaign Composer
                  </button>
                </div>
              )}
            </div>

            <footer className="auth-security-badge" style={{ marginTop: '16px' }}>
              <ShieldCheck size={13} />
              <span>Your data is secure and never shared.</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};
