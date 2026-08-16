import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { ArrowRight } from 'lucide-react';

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

  return (
    <div style={{ maxWidth: '420px', margin: '60px auto 80px', padding: '0 20px' }}>
      <div className="card" style={{ padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            STREETCRAFT ACCOUNT
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '26px', color: 'var(--color-ink)', marginTop: '4px' }}>
            {isSignUp ? 'Create store account' : 'Sign in to store'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '4px' }}>
            {claimToken ? 'Sign up to claim and save your generated promotion.' : 'Access your marketing notebook and campaign proofs.'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 14px', background: 'var(--color-terracotta-faint)', border: '1px solid var(--color-terracotta)', borderRadius: 'var(--radius-xs)', color: 'var(--color-terracotta)', fontSize: '13px', marginBottom: '20px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shop / Business Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. The Roasted Bean"
                  required
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
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

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--color-muted)' }}>
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                className="btn-ghost"
                style={{ padding: '0 4px', color: 'var(--color-primary)', textDecoration: 'underline' }}
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to StreetCraft?{' '}
              <button
                type="button"
                className="btn-ghost"
                style={{ padding: '0 4px', color: 'var(--color-primary)', textDecoration: 'underline' }}
                onClick={() => setIsSignUp(true)}
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
