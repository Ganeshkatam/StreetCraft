import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface LoginPageProps {
  claimToken?: string | null;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ claimToken, onSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, createBusiness } = useAuth();

  // Mode: 'login' | 'signup' | 'setup' | 'complete'
  const [mode, setMode] = useState<'login' | 'signup' | 'setup' | 'complete'>(() => {
    const intent = (location.state as any)?.intent;
    if (intent === 'setup') return 'setup';
    if (location.pathname === '/signup') return 'signup';
    return 'login';
  });

  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Setup State (Steps 1 & 2)
  const [signupStep, setSignupStep] = useState<number>(1);
  const [storeName, setStoreName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [landmarks] = useState('');
  const [category, setCategory] = useState('Artisanal Cafe & Bakery');
  const [signatureItems, setSignatureItems] = useState('Single-Origin Pour-Overs, Sourdough Bakes');
  const [targetCustomer, setTargetCustomer] = useState('Working professionals, freelancers, and neighborhood residents');
  const [slowHours, setSlowHours] = useState('Monday–Thursday, 3:00 PM – 6:00 PM');
  const [defaultOffer, setDefaultOffer] = useState('20% off all pour-overs & fresh bakes');
  const [avgTicketINR, setAvgTicketINR] = useState(350);
  const [phone, setPhone] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      const session = await signIn(email, password);
      if (claimToken && session.activeBusinessId) {
        await api.claimAnonymousCampaign(claimToken, session.activeBusinessId);
      }
      if (onSuccess) onSuccess();

      if (session.activeBusinessId) {
        navigate('/app/dashboard');
      } else {
        setMode('setup');
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await signUp(email, password, name);
      setMode('setup');
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const session = await createBusiness(storeName, category, neighborhood, city, phone);

      if (session.activeBusinessId) {
        await api.updateBusinessProfile(session.activeBusinessId, {
          businessId: session.activeBusinessId,
          name: storeName,
          category,
          neighborhood,
          city,
          landmarks,
          targetCustomer,
          styleVoice: 'Warm, contemporary, artisanal yet unpretentious',
          signatureItems,
          primaryGoal: 'Increase foot traffic',
          peakHours: 'Morning and evening',
          slowHours,
          defaultOffer,
          avgTicketINR: Number(avgTicketINR) || 350,
          phoneWhatsApp: phone,
          updatedAt: new Date().toISOString(),
          targetMonthlyCustomers: 40,
        });

        if (claimToken) {
          await api.claimAnonymousCampaign(claimToken, session.activeBusinessId);
        }
      }

      setMode('complete');
    } catch (err: any) {
      if (err.message?.includes('BUSINESS_LIMIT_REACHED')) {
        setErrorMsg("You've reached your plan's business limit. Upgrade your account to add more businesses.");
      } else {
        setErrorMsg(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', padding: '0 24px 80px', minHeight: 'calc(100vh - 80px)' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '24px 0 16px', borderBottom: '1px solid var(--color-border)', marginBottom: '48px' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '0.02em', color: 'var(--color-ink)' }}>
          STREETCRAFT
        </span>
        <button
          className="btn-ghost"
          style={{ fontSize: '13px', color: 'var(--color-ink-muted)', padding: '4px 0' }}
          onClick={() => navigate('/')}
        >
          &larr; Back
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-xs)', color: 'var(--color-danger)', fontSize: '13px', marginBottom: '24px', maxWidth: '480px', margin: '0 auto 24px' }}>
          {errorMsg}
        </div>
      )}

      {/* VIEW 1: SIGN IN */}
      {mode === 'login' && (
        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)', lineHeight: '1.2', marginBottom: '8px' }}>
            Welcome back.
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-ink-muted)', lineHeight: '1.5', marginBottom: '28px' }}>
            Sign in to access your store memory and active campaigns.
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px 16px', fontSize: '14px', marginTop: '8px' }}
              disabled={isSubmitting || !email || !password}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'} <ArrowRight size={14} />
            </button>
          </form>

          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', fontSize: '13.5px', color: 'var(--color-ink-muted)' }}>
            New to StreetCraft?{' '}
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: '0 4px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
              onClick={() => { setMode('signup'); setErrorMsg(null); }}
            >
              Create an account &rarr;
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: SIGN UP */}
      {mode === 'signup' && (
        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)', lineHeight: '1.2', marginBottom: '8px' }}>
            Create your StreetCraft account.
          </h1>

          <form onSubmit={handleSignup} style={{ marginTop: '28px' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px 16px', fontSize: '14px', marginTop: '8px' }}
              disabled={isSubmitting || !email || !password || !name}
            >
              {isSubmitting ? 'Creating...' : 'Create account'} <ArrowRight size={14} />
            </button>
          </form>

          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', fontSize: '13.5px', color: 'var(--color-ink-muted)' }}>
            Already have an account?{' '}
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: '0 4px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
              onClick={() => { setMode('login'); setErrorMsg(null); }}
            >
              Sign in &rarr;
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: STORE SETUP */}
      {mode === 'setup' && (
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>

          <div style={{ marginBottom: '28px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              STORE ONBOARDING &bull; STEP {signupStep} OF 2
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)', marginTop: '4px' }}>
              Let's set up your business profile.
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '28px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
            {[
              { num: 1, label: '01 Your business' },
              { num: 2, label: '02 Customers & rhythm' },
            ].map((s) => (
              <span
                key={s.num}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12.5px',
                  fontWeight: signupStep === s.num ? 700 : 400,
                  color: signupStep === s.num ? 'var(--color-primary)' : 'var(--color-ink-muted)',
                  borderBottom: signupStep === s.num ? '2px solid var(--color-primary)' : '2px solid transparent',
                  paddingBottom: '4px',
                }}
              >
                {s.label}
              </span>
            ))}
          </div>

          {signupStep === 1 && (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--color-ink)', marginBottom: '16px' }}>
                YOUR BUSINESS IDENTITY
              </h3>

              <div className="form-group">
                <label className="form-label">Shop / Business Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. The Roasted Bean"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Neighborhood / Area</label>
                  <input
                    type="text"
                    className="form-input"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="e.g. Indiranagar"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Business Category</label>
                <input
                  type="text"
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Specialty Coffee & Bakery"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone / WhatsApp <span style={{ color: 'var(--color-ink-muted)' }}>(Optional)</span></label>
                <input
                  type="tel"
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  disabled={!storeName || !neighborhood}
                  onClick={() => setSignupStep(2)}
                >
                  Continue &rarr;
                </button>
              </div>
            </div>
          )}

          {signupStep === 2 && (
            <form onSubmit={handleCompleteSetup} className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--color-ink)', marginBottom: '16px' }}>
                CUSTOMERS, SPECIALS & TIMING
              </h3>

              <div className="form-group">
                <label className="form-label">Signature Items / Best Sellers</label>
                <input
                  type="text"
                  className="form-input"
                  value={signatureItems}
                  onChange={(e) => setSignatureItems(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Customer Persona</label>
                <input
                  type="text"
                  className="form-input"
                  value={targetCustomer}
                  onChange={(e) => setTargetCustomer(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Slow Hours</label>
                <input
                  type="text"
                  className="form-input"
                  value={slowHours}
                  onChange={(e) => setSlowHours(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Default Counter Offer</label>
                  <input
                    type="text"
                    className="form-input"
                    value={defaultOffer}
                    onChange={(e) => setDefaultOffer(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Average Order (INR)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={avgTicketINR}
                    onChange={(e) => setAvgTicketINR(parseInt(e.target.value, 10) || 350)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSignupStep(1)}
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating workspace...' : 'Open Workspace'} &rarr;
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* VIEW 4: ONBOARDING COMPLETE */}
      {mode === 'complete' && (
        <div style={{ maxWidth: '520px', margin: '40px auto', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={20} color="var(--color-primary)" />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-ink)', marginBottom: '8px' }}>
            Your business is ready.
          </h2>

          <button
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: '14.5px', marginTop: '20px' }}
            onClick={() => navigate('/app/dashboard')}
          >
            Go to dashboard &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
