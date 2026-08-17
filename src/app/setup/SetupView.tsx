'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { getUserFacingErrorMessage } from '../../lib/userFacingError';
import {
  Store,
  ShieldCheck,
  Check
} from 'lucide-react';

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimToken = searchParams.get('claim');
  const { session, createBusiness, signOut } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [createdBusinessId, setCreatedBusinessId] = useState<string | null>(session.activeBusinessId || null);
  const [storeName, setStoreName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [category, setCategory] = useState('Artisanal Cafe & Bakery');
  const [signatureItems, setSignatureItems] = useState('Single-Origin Pour-Overs, Sourdough Bakes');
  const [targetCustomer, setTargetCustomer] = useState('Working professionals, freelancers, and neighborhood residents');
  const [slowHours, setSlowHours] = useState('Monday–Thursday, 3:00 PM – 6:00 PM');
  const [defaultOffer, setDefaultOffer] = useState('20% off all pour-overs & fresh bakes');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResuming, setIsResuming] = useState(true);

  // Progressive Onboarding: Pre-fill and auto-resume if store already exists
  useEffect(() => {
    const activeId = session.activeBusinessId;
    if (activeId) {
      setCreatedBusinessId(activeId);
      api.getBusinessProfile(activeId)
        .then((prof) => {
          if (prof) {
            setStoreName(prof.name || '');
            setCategory(prof.category || 'Artisanal Cafe & Bakery');
            setNeighborhood(prof.neighborhood || '');
            setCity(prof.city || 'Bengaluru');
            if (prof.signatureItems) setSignatureItems(prof.signatureItems);
            if (prof.slowHours) setSlowHours(prof.slowHours);
            if (prof.defaultOffer) setDefaultOffer(prof.defaultOffer);
            if (prof.targetCustomer) setTargetCustomer(prof.targetCustomer);
            if (prof.phoneWhatsApp) setPhone(prof.phoneWhatsApp);
            // If the core identity is already persisted, resume on Step 2
            if (prof.name && prof.neighborhood) {
              setStep(2);
            }
          }
        })
        .catch(() => {
          // Fallback to Step 1 if profile fetch fails
        })
        .finally(() => {
          setIsResuming(false);
        });
    } else {
      setIsResuming(false);
    }
  }, [session.activeBusinessId]);

  // Step 1: Immediately persist the business entity to PostgreSQL
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !neighborhood) return;

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (!createdBusinessId) {
        // Atomic creation in database
        const activeSession = await createBusiness(storeName, category, neighborhood, city, phone);
        if (activeSession.activeBusinessId) {
          setCreatedBusinessId(activeSession.activeBusinessId);
          if (claimToken) {
            await api.claimAnonymousCampaign(claimToken, activeSession.activeBusinessId);
          }
        }
      } else {
        // Business already exists; update identity changes
        await api.updateBusinessProfile(createdBusinessId, {
          name: storeName,
          category,
          neighborhood,
          city,
          phoneWhatsApp: phone,
        });
      }
      setStep(2);
    } catch (err: unknown) {
      setErrorMsg(getUserFacingErrorMessage(err, 'Failed to save store identity. Please check your connection and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Persist operating rhythm & detailed store context
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const bizId = createdBusinessId || session.activeBusinessId;
      if (bizId) {
        await api.updateBusinessProfile(bizId, {
          businessId: bizId,
          name: storeName,
          category,
          neighborhood,
          city,
          landmarks: '',
          targetCustomer,
          styleVoice: 'Warm, contemporary, artisanal yet unpretentious',
          signatureItems,
          primaryGoal: 'Increase foot traffic',
          peakHours: 'Morning and evening',
          slowHours,
          defaultOffer,
          avgTicketINR: 350,
          phoneWhatsApp: phone,
          updatedAt: new Date().toISOString(),
          targetMonthlyCustomers: 40,
        });

        if (claimToken) {
          await api.claimAnonymousCampaign(claimToken, bizId);
        }
      }
      setStep(3);
    } catch (err: unknown) {
      setErrorMsg(getUserFacingErrorMessage(err, 'Failed to save store preferences. Please review your details and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isResuming) {
    return (
      <div className="auth-full-viewport" style={{ backgroundImage: "url('/setup_full.jpg')" }}>
        <div className="auth-backdrop-overlay" />
        <div className="auth-content-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ color: 'var(--color-surface)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
            Loading store setup...
          </div>
        </div>
      </div>
    );
  }

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
              router.push('/');
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
                  <div className="auth-value-desc">
                    {createdBusinessId ? 'Saved to database' : 'Name, neighborhood, city, and category'}
                  </div>
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
            </div>
          </div>

          <div className="auth-card-col">
            <div className="auth-card">
              {errorMsg && (
                <div className="auth-error-alert">
                  {errorMsg}
                </div>
              )}

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
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="form-select"
                      >
                        <option value="Cafe & Coffee Bar">Café & Coffee Bar</option>
                        <option value="Bakery & Patisserie">Bakery & Patisserie</option>
                        <option value="Restaurant & Diner">Restaurant & Diner</option>
                        <option value="Pizzeria & Trattoria">Pizzeria & Trattoria</option>
                        <option value="Artisanal Food Studio">Artisanal Food Studio</option>
                        <option value="Retail Boutique">Retail Boutique</option>
                        <option value="Salon & Wellness Studio">Salon & Wellness Studio</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                      <div>
                        <label className="auth-form-label">Area / Neighborhood</label>
                        <input
                          type="text"
                          required
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          placeholder="e.g. Indiranagar"
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
                          placeholder="e.g. Bengaluru"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!storeName || !neighborhood || isSubmitting}
                      className="auth-submit-btn"
                    >
                      {isSubmitting ? 'Saving store...' : 'Save & Continue \u2192'}
                    </button>
                  </form>
                </div>
              )}

              {step === 2 && (
                <div>
                  <span className="section-eyebrow">STEP 2 OF 2 &bull; OPERATING RHYTHM</span>
                  <h2 className="auth-card-title">What shapes your campaigns</h2>

                  <form onSubmit={handleStep2Submit}>
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
                      <label className="auth-form-label">When does the business usually get quiet?</label>
                      <input
                        type="text"
                        value={slowHours}
                        onChange={(e) => setSlowHours(e.target.value)}
                        placeholder="The hours or days you'd most like to fill"
                        className="form-input"
                      />
                    </div>

                    <div className="auth-form-field" style={{ marginBottom: '16px' }}>
                      <label className="auth-form-label">Store WhatsApp or counter phone (optional)</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Number for customer inquiries or bookings"
                        className="form-input"
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="btn-secondary"
                        style={{ padding: '8px 12px', fontSize: '12.5px' }}
                      >
                        &larr; Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="auth-submit-btn"
                        style={{ flex: 1 }}
                      >
                        {isSubmitting ? 'Saving preferences...' : 'Launch Workspace \u2192'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {step === 3 && (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div className="auth-value-icon" style={{ width: '42px', height: '42px', margin: '0 auto 12px' }}>
                    <Check size={22} strokeWidth={2.5} />
                  </div>
                  <h2 className="auth-card-title">Store Workspace Ready</h2>
                  <p className="auth-card-subtitle" style={{ margin: '0 0 18px' }}>
                    {storeName || 'Your store'} has been configured and saved. Let&apos;s create your first campaign.
                  </p>
                  <button
                    onClick={() => router.push('/app/create')}
                    className="auth-submit-btn"
                  >
                    Open Campaign Composer &rarr;
                  </button>
                </div>
              )}
            </div>

            <footer className="auth-security-badge">
              <ShieldCheck size={13} />
              <span>Your data is secure and never shared.</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

export function SetupView() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--color-bg)' }} />}>
      <SetupContent />
    </Suspense>
  );
}
