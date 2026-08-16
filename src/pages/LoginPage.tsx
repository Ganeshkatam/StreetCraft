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
  const { signIn, signUp } = useAuth();

  // Mode: 'login' | 'signup' | 'forgot'
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(() => {
    if (location.pathname === '/signup') return 'signup';
    if (location.pathname === '/forgot-password') return 'forgot';
    return 'login';
  });

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Setup / Registration Step State
  const [signupStep, setSignupStep] = useState<number>(1);
  const [storeName, setStoreName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [category, setCategory] = useState('Artisanal Cafe & Bakery');
  const [targetCustomer, setTargetCustomer] = useState('Working professionals, freelancers, and neighborhood residents');
  const [slowHours, setSlowHours] = useState('Monday–Thursday, 3:00 PM – 6:00 PM');
  const [defaultOffer, setDefaultOffer] = useState('20% off all pour-overs & fresh bakes');
  const [ownerName, setOwnerName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const session = await signIn(loginEmail, loginPassword);
      if (claimToken && session.activeBusinessId) {
        await api.claimAnonymousCampaign(claimToken, session.activeBusinessId);
      }
      if (onSuccess) onSuccess();
      navigate('/app/dashboard');
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Store Onboarding Registration
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const session = await signUp(signupEmail, signupPassword, ownerName, storeName);
      
      if (session.activeBusinessId) {
        await api.updateBusinessProfile(session.activeBusinessId, {
          businessId: session.activeBusinessId,
          name: storeName,
          category,
          neighborhood,
          city,
          landmarks: '',
          targetCustomer,
          styleVoice: 'Warm, contemporary, artisanal yet unpretentious',
          signatureItems: 'Signature brew and fresh daily offerings',
          primaryGoal: 'Increase foot traffic',
          peakHours: 'Morning and evening',
          slowHours,
          defaultOffer,
          avgTicketINR: 350,
          targetMonthlyCustomers: 40,
          phoneWhatsApp: '',
          updatedAt: new Date().toISOString(),
        });

        if (claimToken) {
          await api.claimAnonymousCampaign(claimToken, session.activeBusinessId);
        }
      }

      setSetupComplete(true);
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSubmitted(true);
  };

  return (
    <div style={{ maxWidth: '880px', margin: '0 auto', padding: '0 24px 80px', minHeight: 'calc(100vh - 80px)' }}>
      
      {/* Quiet Single App Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '24px 0 16px', borderBottom: '1px solid var(--color-border)', marginBottom: '56px' }}>
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
        <div style={{ padding: '12px 16px', background: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-xs)', color: 'var(--color-danger)', fontSize: '13px', marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px' }}>
          {errorMsg}
        </div>
      )}

      {/* =========================================================================
          VIEW 1: SIGN IN MODE (Quiet, Dignified Entrance)
         ========================================================================= */}
      {mode === 'login' && (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)', lineHeight: '1.2', marginBottom: '8px' }}>
            Welcome back.
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--color-ink-muted)', lineHeight: '1.5', marginBottom: '32px' }}>
            Pick up where you left off.
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '13px' }}>Email</label>
              <input
                type="email"
                className="form-input"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="owner@roastedbean.in"
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0, fontSize: '13px' }}>Password</label>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ fontSize: '12px', padding: 0, color: 'var(--color-ink-muted)' }}
                  onClick={() => { setMode('forgot'); setErrorMsg(null); }}
                >
                  Forgot password?
                </button>
              </div>
              <input
                type="password"
                className="form-input"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px 16px', fontSize: '14px', marginTop: '8px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Entering...' : 'Continue'} <ArrowRight size={14} />
            </button>
          </form>

          {claimToken && (
            <div style={{ marginTop: '28px', padding: '14px 16px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', fontSize: '12.5px', color: 'var(--color-ink)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--color-primary)', display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>UNCLAIMED CAMPAIGN</span>
              Your generated promotion is waiting to be linked to your store.
            </div>
          )}

          <div style={{ marginTop: '36px', paddingTop: '20px', borderTop: '1px solid var(--color-border)', fontSize: '13.5px', color: 'var(--color-ink-muted)' }}>
            New to StreetCraft?{' '}
            <button
              type="button"
              className="btn-ghost"
              style={{ padding: '0 4px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
              onClick={() => { setMode('signup'); setErrorMsg(null); }}
            >
              Set up your business &rarr;
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: SIGN UP MODE (In-App Store Setup Room)
         ========================================================================= */}
      {mode === 'signup' && !setupComplete && (
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '32px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              STORE ONBOARDING
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', color: 'var(--color-ink)', marginTop: '4px' }}>
              Let's set up your corner of StreetCraft.
            </h1>
          </div>

          {/* Setup Progress Indicators */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', borderBottom: '1px solid var(--color-border)', paddingBottom: '14px' }}>
            {[
              { num: 1, label: '01 Your business' },
              { num: 2, label: '02 Your customers' },
              { num: 3, label: '03 Your account' },
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

          {/* STEP 1: Business Identity */}
          {signupStep === 1 && (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--color-ink)', marginBottom: '20px' }}>
                YOUR BUSINESS
              </h3>

              <div className="form-group">
                <label className="form-label">What do people know you as?</label>
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
                  <label className="form-label">Where are you located?</label>
                  <input
                    type="text"
                    className="form-input"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="e.g. Indiranagar, Bengaluru"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">What kind of place are you?</label>
                  <input
                    type="text"
                    className="form-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Specialty Cafe & Bakery"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setMode('login')}
                >
                  Already have an account? Sign In
                </button>
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

          {/* STEP 2: Store Rhythm & Customers */}
          {signupStep === 2 && (
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--color-ink)', marginBottom: '20px' }}>
                YOUR CUSTOMERS & RHYTHM
              </h3>

              <div className="form-group">
                <label className="form-label">Who usually walks through your doors?</label>
                <input
                  type="text"
                  className="form-input"
                  value={targetCustomer}
                  onChange={(e) => setTargetCustomer(e.target.value)}
                  placeholder="e.g. Working professionals, freelancers, local neighbors"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">When is it typically quiet? (Promotions target this window)</label>
                <input
                  type="text"
                  className="form-input"
                  value={slowHours}
                  onChange={(e) => setSlowHours(e.target.value)}
                  placeholder="e.g. Monday–Thursday, 3:00 PM – 6:00 PM"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">What is your go-to counter special or perk?</label>
                <input
                  type="text"
                  className="form-input"
                  value={defaultOffer}
                  onChange={(e) => setDefaultOffer(e.target.value)}
                  placeholder="e.g. 20% off all pour-overs with fresh bakery bakes"
                  required
                />
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
                  type="button"
                  className="btn-primary"
                  onClick={() => setSignupStep(3)}
                >
                  Continue &rarr;
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Store Account & Password */}
          {signupStep === 3 && (
            <form onSubmit={handleCompleteRegistration} className="card" style={{ padding: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '19px', color: 'var(--color-ink)', marginBottom: '20px' }}>
                YOUR STORE ACCOUNT
              </h3>

              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Store Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="e.g. owner@roastedbean.in"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '28px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSignupStep(2)}
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting || !signupEmail || !signupPassword || !ownerName}
                >
                  {isSubmitting ? 'Setting up...' : 'Open Store Workspace'} &rarr;
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* =========================================================================
          VIEW 3: ONBOARDING COMPLETE (Instant Transition into Product)
         ========================================================================= */}
      {mode === 'signup' && setupComplete && (
        <div style={{ maxWidth: '480px', margin: '40px auto', textAlign: 'center' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={20} color="var(--color-primary)" />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-ink)', marginBottom: '8px' }}>
            Your business is ready.
          </h2>

          <div style={{ padding: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', margin: '20px 0 24px', textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: 'var(--color-ink)' }}>
              {storeName.toUpperCase()}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {neighborhood} &bull; {category}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', marginTop: '8px' }}>
              Targeting slow window: {slowHours}
            </div>
          </div>

          <p style={{ fontSize: '14.5px', color: 'var(--color-ink-muted)', marginBottom: '28px', lineHeight: '1.5' }}>
            Now let's find something worth putting in front of your customers.
          </p>

          <button
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: '14.5px' }}
            onClick={() => navigate('/app/create')}
          >
            Create first campaign &rarr;
          </button>
        </div>
      )}

      {/* =========================================================================
          VIEW 4: FORGOT PASSWORD
         ========================================================================= */}
      {mode === 'forgot' && (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '30px', color: 'var(--color-ink)', marginBottom: '8px' }}>
            Let's get you back in.
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5', marginBottom: '28px' }}>
            Enter your store email and we'll send you a link to reset your password.
          </p>

          {forgotSubmitted ? (
            <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>
                Reset link sent
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginBottom: '20px' }}>
                Check your inbox at <strong>{forgotEmail}</strong> for instructions to access your account.
              </p>
              <button
                className="btn-secondary"
                onClick={() => { setMode('login'); setForgotSubmitted(false); }}
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '13px' }}>Store Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="owner@roastedbean.in"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '14px', marginTop: '10px' }}
              >
                Send reset link &rarr;
              </button>

              <div style={{ textAlign: 'center', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ fontSize: '13px', color: 'var(--color-ink-muted)' }}
                  onClick={() => setMode('login')}
                >
                  &larr; Return to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      )}

    </div>
  );
};
