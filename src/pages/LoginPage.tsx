import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { getUserFacingErrorMessage } from '../lib/userFacingError';
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
        const fromPath = (location.state as any)?.from;
        navigate(fromPath && fromPath.startsWith('/app') ? fromPath : '/app/today');
      } else {
        navigate('/setup');
      }
    } catch (err) {
      setErrorMsg(getUserFacingErrorMessage(err, 'Failed to sign in. Please verify your credentials and try again.'));
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
            &larr; Back to site
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
              {errorMsg && (
                <div className="auth-error-alert">
                  {errorMsg}
                </div>
              )}

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
                  {isSubmitting ? 'Signing in...' : 'Sign in \u2192'}
                </button>
              </form>

              <div className="auth-switch-text" style={{ marginTop: '20px' }}>
                New to StreetCraft?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="auth-switch-link"
                >
                  Create an account &rarr;
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
