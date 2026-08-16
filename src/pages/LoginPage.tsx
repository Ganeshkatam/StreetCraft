import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { ArrowRight, ShieldCheck, Mail, Lock, Store, User, KeyRound } from 'lucide-react';

interface LoginPageProps {
  claimToken?: string | null;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ claimToken, onSuccess }) => {
  const navigate = useNavigate();
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
      navigate('/app/dashboard');
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
    <div style={{ minHeight: 'calc(100vh - var(--layout-header-height) - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 20px 80px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        
        {/* Top Wordmark & Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.14em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            STREETCRAFT
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--color-ink)', letterSpacing: '-0.01em', lineHeight: '1.2' }}>
            {isSignUp ? 'Create your store account' : 'Welcome back'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginTop: '6px', lineHeight: '1.5' }}>
            {isSignUp
              ? 'Start turning slow afternoons into active promotions.'
              : 'Sign in to coordinate your local campaigns and store memory.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="card" style={{ padding: '32px 28px', boxShadow: 'var(--shadow-sheet)' }}>
          
          {/* Segmented Pill Switcher */}
          <div style={{ display: 'flex', background: 'var(--color-surface-2)', padding: '4px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
              style={{
                flex: 1,
                padding: '8px 0',
                fontSize: '13px',
                fontWeight: !isSignUp ? 600 : 500,
                color: !isSignUp ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                background: !isSignUp ? 'var(--color-surface-raised)' : 'transparent',
                borderRadius: 'var(--radius-xs)',
                border: !isSignUp ? '1px solid var(--color-border)' : '1px solid transparent',
                boxShadow: !isSignUp ? 'var(--shadow-subtle)' : 'none',
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
                padding: '8px 0',
                fontSize: '13px',
                fontWeight: isSignUp ? 600 : 500,
                color: isSignUp ? 'var(--color-ink)' : 'var(--color-ink-muted)',
                background: isSignUp ? 'var(--color-surface-raised)' : 'transparent',
                borderRadius: 'var(--radius-xs)',
                border: isSignUp ? '1px solid var(--color-border)' : '1px solid transparent',
                boxShadow: isSignUp ? 'var(--shadow-subtle)' : 'none',
                textAlign: 'center',
                transition: 'var(--motion-fast)',
              }}
            >
              Create Account
            </button>
          </div>

          {claimToken && (
            <div style={{ padding: '12px 14px', background: 'var(--color-primary-subtle)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-xs)', color: 'var(--color-primary)', fontSize: '12.5px', marginBottom: '20px', lineHeight: '1.4' }}>
              <strong>Campaign Ready:</strong> {isSignUp ? 'Create your account' : 'Sign in'} to save your generated proofs directly into your store vault.
            </div>
          )}

          {errorMsg && (
            <div style={{ padding: '10px 14px', background: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-xs)', color: 'var(--color-danger)', fontSize: '12.5px', marginBottom: '20px' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12.5px' }}>Your Name</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <User size={15} color="var(--color-ink-subtle)" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '12.5px' }}>Store / Shop Name</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Store size={15} color="var(--color-ink-subtle)" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
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
              <label className="form-label" style={{ fontSize: '12.5px' }}>Store Email</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={15} color="var(--color-ink-subtle)" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. owner@roastedbean.in"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '12.5px' }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={15} color="var(--color-ink-subtle)" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '36px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <button
                type="button"
                className="btn-ghost"
                style={{ fontSize: '12px', padding: '0', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                onClick={fillDemoCredentials}
              >
                <KeyRound size={13} /> Fill demo account
              </button>
              <span style={{ fontSize: '11px', color: 'var(--color-ink-subtle)' }}>No credit card required</span>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '13.5px' }}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Authenticating...'
                : isSignUp
                ? 'Create Store Account'
                : 'Sign In'}{' '}
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Footnote */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--color-ink-muted)' }}>
            <ShieldCheck size={13} color="var(--color-primary)" />
            <span>Protected by PostgreSQL Row-Level Security</span>
          </div>
        </div>

      </div>
    </div>
  );
};
