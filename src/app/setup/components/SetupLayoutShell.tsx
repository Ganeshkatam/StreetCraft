import React from 'react';
import Link from 'next/link';
import { Store, ShieldCheck, Check } from 'lucide-react';

interface SetupLayoutShellProps {
  currentStep: 1 | 2;
  children: React.ReactNode;
}

export const SetupLayoutShell: React.FC<SetupLayoutShellProps> = ({ currentStep, children }) => {
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

          <Link href="/user/today" className="auth-back-btn">
            Set up later
          </Link>
        </header>

        <main className="auth-main-grid">
          <div className="auth-hero-col">
            <div className="auth-hero-card">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: 'rgba(18, 41, 28, 0.08)',
                    color: '#12291C',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    border: '1px solid rgba(18, 41, 28, 0.12)',
                  }}
                >
                  STEP {currentStep} OF 2
                </span>
              </div>

              <h1 className="auth-hero-title">
                Teach StreetCraft<br />
                <span className="auth-hero-italic">about your store.</span>
              </h1>

              <p className="auth-hero-subtitle">
                StreetCraft uses your location, rhythm, and signature items to generate promotions that feel authentic to your counter.
              </p>

              {/* Stepper Progress Indicator */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '20px',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      height: '4px',
                      background: currentStep >= 1 ? 'var(--color-primary, #15803D)' : 'rgba(0, 0, 0, 0.12)',
                      borderRadius: '2px',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: currentStep === 1 ? 700 : 500,
                      color: currentStep === 1 ? '#111827' : '#6B7280',
                    }}
                  >
                    01 Identity & Location
                  </span>
                </div>

                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div
                    style={{
                      height: '4px',
                      background: currentStep >= 2 ? 'var(--color-primary, #15803D)' : 'rgba(0, 0, 0, 0.12)',
                      borderRadius: '2px',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: currentStep === 2 ? 700 : 500,
                      color: currentStep === 2 ? '#111827' : '#6B7280',
                    }}
                  >
                    02 Operating Rhythm
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-card-col">
            <div className="auth-card">
              {children}
            </div>

            <footer className="auth-security-badge" style={{ marginTop: '16px' }}>
              <ShieldCheck size={13} />
              <span>Your data is secure and protected</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};
