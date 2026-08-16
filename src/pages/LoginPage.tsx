import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { ArrowRight, ShieldCheck, Lock } from 'lucide-react';

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
    <div style={{ maxWidth: '440px', margin: '60px auto 80px', padding: '0 20px' }}>
      <div className="card" style={{ padding: '36px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-logo-icon" style={{ margin: '0 auto 12px', width: '36px', height: '36px', fontSize: '16px' }}>S</div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF' }}>
            {isSignUp ? 'Create Store Account' : 'Sign In to Studio'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {claimToken ? 'Sign up to claim and save your generated promotion.' : 'Access your store memory and live campaign studio.'}
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 14px', background: 'var(--accent-rose-subtle)', border: '1px solid var(--accent-rose)', borderRadius: 'var(--radius-xs)', color: 'var(--accent-rose)', fontSize: '13px', marginBottom: '20px' }}>
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

          <div style={{ background: 'var(--bg-input)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <ShieldCheck size={14} color="var(--accent-emerald)" />
            <span>Supabase Auth &bull; PostgreSQL Row-Level Security</span>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : isSignUp ? 'Create Account & Open Studio' : 'Sign In'} <ArrowRight size={14} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                className="btn-ghost"
                style={{ padding: '0 4px', color: 'var(--accent-emerald)', textDecoration: 'underline' }}
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
                style={{ padding: '0 4px', color: 'var(--accent-emerald)', textDecoration: 'underline' }}
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
