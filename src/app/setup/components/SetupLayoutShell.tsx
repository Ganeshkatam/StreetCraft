import React from 'react';
import { Store, ShieldCheck } from 'lucide-react';

interface SetupLayoutShellProps {
  currentStep: 1 | 2;
  children: React.ReactNode;
}

export const SetupLayoutShell: React.FC<SetupLayoutShellProps> = ({ currentStep, children }) => {
  return (
    <div
      className="setup-unified-viewport"
      style={{ backgroundImage: "url('/setup_full.jpg')" }}
    >
      <div className="auth-backdrop-overlay" />

      <div className="setup-unified-console">
        {/* Left Side: Brand Context, Editorial Hero & Stepper */}
        <aside className="setup-console-sidebar">
          <div>
            <div className="auth-brand-badge" style={{ marginBottom: '28px', display: 'inline-flex' }}>
              <div className="auth-logo-badge">
                <Store size={20} strokeWidth={2.2} />
              </div>
              <div>
                <div className="auth-logo-title">STREETCRAFT</div>
                <div className="auth-logo-subtitle">STORE SETUP ONBOARDING</div>
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(18, 41, 28, 0.08)',
                  color: '#12291C',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                }}
              >
                STEP {currentStep} OF 2
              </span>
            </div>

            <h1 className="auth-hero-title" style={{ fontSize: '30px', marginBottom: '12px', lineHeight: 1.18 }}>
              Teach StreetCraft<br />
              <span className="auth-hero-italic">about your store.</span>
            </h1>

            <p className="auth-hero-subtitle" style={{ fontSize: '13.5px', marginBottom: '0', lineHeight: 1.5 }}>
              StreetCraft uses your location, rhythm, and signature items to generate promotions that feel authentic to your counter.
            </p>
          </div>

          <div style={{ marginTop: '32px' }}>
            {/* Stepper Progress Indicator */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
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
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: currentStep === 1 ? 700 : 500,
                    color: currentStep === 1 ? '#111827' : '#6B7280',
                  }}
                >
                  01 Identity
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
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: currentStep === 2 ? 700 : 500,
                    color: currentStep === 2 ? '#111827' : '#6B7280',
                  }}
                >
                  02 Rhythm
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#4B5563',
                fontSize: '11.5px',
              }}
            >
              <ShieldCheck size={14} color="#15803D" />
              <span>Your data is secure and protected</span>
            </div>
          </div>
        </aside>

        {/* Right Side: Active Step Form Action Canvas */}
        <main className="setup-console-canvas">
          {children}
        </main>
      </div>
    </div>
  );
};
