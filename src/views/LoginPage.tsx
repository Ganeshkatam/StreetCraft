import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { supabase, isGoogleOAuthEnabled } from '../lib/supabase';
import { getUserFacingErrorMessage } from '../lib/userFacingError';
import { toast } from 'sonner';
import {
  Store,
  Megaphone,
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

interface LoginPageProps {
  claimToken?: string | null;
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ claimToken, onSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      if (errorParam === 'email_confirmation_failed') {
        toast.error('Email confirmation link was invalid or has expired. Please sign in or request a new link.');
      } else if (errorParam === 'auth_exchange_failed') {
        toast.error('Authentication session exchange failed. Please sign in again.');
      } else {
        toast.error(getUserFacingErrorMessage(decodeURIComponent(errorParam), 'Authentication was not completed. Please sign in again.'));
      }
    }
  }, [location.search]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const session = await signIn(email, password);
      if (claimToken && session.activeBusinessId) {
        await api.claimAnonymousCampaign(claimToken, session.activeBusinessId);
      }
      if (onSuccess) onSuccess();

      toast.success('Signed in successfully.');

      if (session.activeBusinessId) {
        const fromPath = (location.state as any)?.from;
        navigate(fromPath && fromPath.startsWith('/app') ? fromPath : '/app/today');
      } else {
        navigate('/setup');
      }
    } catch (err) {
      toast.error(getUserFacingErrorMessage(err, 'Failed to sign in. Please verify your credentials and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="auth-full-viewport"
      style={{ backgroundImage: "url('/login_full.jpg')" }}
    >
      {/* Soft warm paper backdrop overlay for typography legibility */}
      <div className="auth-backdrop-overlay" />

      {/* Foreground Content Container */}
      <div className="auth-content-container">
        {/* Top Header */}
        <header className="auth-header">
          <div className="auth-brand-badge" onClick={() => navigate('/')}>
            <div className="auth-logo-badge">
              <Store size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="auth-logo-title">STREETCRAFT</div>
              <div className="auth-logo-subtitle">GROWTH ENGINE</div>
            </div>
          </div>

          <button className="auth-back-btn" onClick={() => navigate('/')}>
            Back to site
          </button>
        </header>

        {/* Main 2-Column Grid */}
        <main className="auth-main-grid">
          {/* Left Column: Brand Story & Value Props */}
          <div className="auth-hero-col">
            <h1 className="auth-hero-title">
              Welcome back,<br />
              <span className="auth-hero-italic">let&apos;s grow your store.</span>
            </h1>

            <p className="auth-hero-subtitle">
              Your store, campaigns, and opportunities are waiting.
            </p>

            <div className="auth-value-props">
              <div className="auth-value-item">
                <div className="auth-value-icon">
                  <Store size={17} strokeWidth={2} />
                </div>
                <div>
                  <div className="auth-value-title">Built for physical businesses</div>
                  <div className="auth-value-desc">Cafés, restaurants, bakeries, boutiques, salons, and specialty stores.</div>
                </div>
              </div>

              <div className="auth-value-item">
                <div className="auth-value-icon">
                  <Megaphone size={17} strokeWidth={2} />
                </div>
                <div>
                  <div className="auth-value-title">One opportunity. Everything customers need to see.</div>
                  <div className="auth-value-desc">Turn one business opportunity into coordinated storefront content instantly.</div>
                </div>
              </div>

              <div className="auth-value-item">
                <div className="auth-value-icon">
                  <Sparkles size={17} strokeWidth={2} />
                </div>
                <div>
                  <div className="auth-value-title">Built around your business</div>
                  <div className="auth-value-desc">Your products, offers, operating rhythm, and store context shape every campaign.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Auth Card */}
          <div className="auth-card-col">
            <div className="auth-card">
              <h2 className="auth-card-title">Sign in to StreetCraft</h2>
              <p className="auth-card-subtitle">Enter your details to continue.</p>

              <form onSubmit={handleLogin}>
                <div className="auth-form-field">
                  <label className="auth-form-label">Email</label>
                  <div className="auth-input-wrapper">
                    <Mail size={15} className="auth-input-icon" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@yourbusiness.com"
                      className="auth-input"
                    />
                  </div>
                </div>

                <div className="auth-form-field">
                  <label className="auth-form-label">Password</label>
                  <div className="auth-input-wrapper">
                    <Lock size={15} className="auth-input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="auth-input auth-input-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-input-password-toggle"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="auth-options-row">
                  <label className="auth-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="auth-checkbox-input"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="auth-forgot-link"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="auth-submit-btn"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {isGoogleOAuthEnabled && (
                <>
                  <div className="auth-or-divider">
                    <div className="auth-or-line" />
                    <span className="auth-or-pill">or</span>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsSubmitting(true);
                      try {
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: 'google',
                          options: {
                            redirectTo: window.location.origin + '/app',
                          },
                        });
                        if (error) throw error;
                      } catch (err: any) {
                        toast.error(getUserFacingErrorMessage(err, 'Failed to initiate Google sign-in.'));
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="auth-google-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}

              <div className="auth-switch-text" style={{ marginTop: '20px' }}>
                New to StreetCraft?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="auth-switch-link"
                >
                  Create an account
                </button>
              </div>
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
};
