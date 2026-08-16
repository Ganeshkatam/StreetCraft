import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { ArrowRight, ShieldCheck, Check, Store, Sparkles, Lock, Mail, User } from 'lucide-react';

interface LoginPageProps {
  navigate: (route: string) => void;
  claimToken?: string | null;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate, claimToken, onSuccess }) => {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const session = await signUp(email, password, fullName, businessName);
        if (claimToken && session.activeBusinessId) {
          await api.claimAnonymousCampaign(claimToken, session.activeBusinessId);
        }
      } else {
        const session = await signIn(email, password);
        if (claimToken && session.activeBusinessId) {
          await api.claimAnonymousCampaign(claimToken, session.activeBusinessId);
        }
      }

      if (onSuccess) onSuccess();
      navigate('app/dashboard');
    } catch (err) {
      setErrorMsg((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@roastedbean.in');
    setPassword('streetcraft2026');
    if (isSignUp) {
      setFullName('Aarav Sharma');
      setBusinessName('The Roasted Bean');
    }
  };

  return (
    <div style={{ maxWidth: '1040px', margin: '48px auto 96px', padding: '0 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '48px', alignItems: 'center' }}>
        
        {/* Left Column: Editorial Brand Story & Proof */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-xs)', marginBottom: '20px' }}>
            <Store size={13} color="var(--color-primary)" />
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              STREETCRAFT
            </span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '38px', lineHeight: '1.15', color: 'var(--color-ink)', marginBottom: '16px' }}>
            Turn one store moment into a reason to visit.
          </h1>

          <p style={{ fontSize: '16px', color: 'var(--color-ink-muted)', lineHeight: '1.6', marginBottom: '28px' }}>
            Your Tuesday afternoon is quiet. Your customers don't have to know that. Coordinate Google, Instagram, WhatsApp, and in-store marketing in one place.
          </p>

          {/* Micro-Proof Preview Card */}
          <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '20px', boxShadow: 'var(--shadow-paper)', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase' }}>
                LIVE STORE PROOF
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>Indiranagar, Bengaluru</span>
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
              "Afternoon Focus Hour — 20% off pour-overs & sourdough bakes"
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.5' }}>
              Synchronized across Google Search, Instagram Reel hooks, WhatsApp Broadcast, and counter QR card.
            </div>
          </div>

          {/* Three Key Tenets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Learns your neighborhood landmarks, slow hours, and signature items',
              'Generates ready-to-publish copy with character limits enforced',
              'Keep 100% of your walk-in revenue — zero commissions or agency fees',
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', color: 'var(--color-ink-soft)' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={11} color="var(--color-primary)" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Refined Auth Form Card */}
        <div className="card" style={{ padding: '36px 32px', boxShadow: 'var(--shadow-sheet)' }}>
          {/* Form Header Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '24px', paddingBottom: '2px' }}>
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: '14.5px',
                fontWeight: !isSignUp ? 600 : 400,
                color: !isSignUp ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                borderBottom: !isSignUp ? '2px solid var(--color-primary)' : '2px solid transparent',
                textAlign: 'center',
                transition: 'var(--motion-fast)',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
              style={{
                flex: 1,
                padding: '10px 0',
                fontSize: '14.5px',
                fontWeight: isSignUp ? 600 : 400,
                color: isSignUp ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                borderBottom: isSignUp ? '2px solid var(--color-primary)' : '2px solid transparent',
                textAlign: 'center',
                transition: 'var(--motion-fast)',
              }}
            >
              Create Account
            </button>
          </div>

          {claimToken && (
            <div style={{ padding: '12px 14px', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-xs)', color: 'var(--color-primary)', fontSize: '12.5px', marginBottom: '20px', lineHeight: '1.4' }}>
              <strong>Campaign Pack Ready:</strong> {isSignUp ? 'Create your account' : 'Sign in'} to save your generated promotion directly into your store vault.
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '10px 14px', background: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-xs)', color: 'var(--color-danger)', fontSize: '13px', marginBottom: '20px' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div className="form-group">
                  <label className="form-label">Your Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Shop / Business Name</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-input"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. The Roasted Bean"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Store Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. owner@roastedbean.in"
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
                placeholder="••••••••"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <button
                type="button"
                className="btn-ghost"
                style={{ fontSize: '11.5px', padding: 0, color: 'var(--color-primary)' }}
                onClick={fillDemoCredentials}
              >
                Fill demo credentials
              </button>
              <span style={{ fontSize: '11px', color: 'var(--color-ink-subtle)' }}>No credit card required</span>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: '14px' }}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Authenticating...'
                : isSignUp
                ? 'Create Store Account & Open Workspace'
                : 'Sign In'}{' '}
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Privacy & Security Footnote */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--color-ink-muted)' }}>
            <ShieldCheck size={14} color="var(--color-primary)" />
            <span>Encrypted with PostgreSQL Row-Level Security</span>
          </div>
        </div>

      </div>
    </div>
  );
};
