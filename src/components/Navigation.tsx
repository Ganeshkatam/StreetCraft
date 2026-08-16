import React from 'react';
import { UserSession } from '../types/business';
import { UsageSummary } from '../types/billing';
import { ArrowRight, LogOut, Zap } from 'lucide-react';

interface NavigationProps {
  currentRoute: string;
  navigate: (route: string) => void;
  session: UserSession;
  usage: UsageSummary | null;
  onOpenAuth: () => void;
  onOpenUpgrade: () => void;
  onSignOut: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRoute,
  navigate,
  session,
  usage,
  onOpenAuth,
  onOpenUpgrade,
  onSignOut,
}) => {
  const isAppView = currentRoute.startsWith('app');

  return (
    <header className="main-header">
      <div className="header-container">
        <div
          className="brand-wrapper"
          onClick={() => navigate(session.isAuthenticated ? 'app/dashboard' : 'home')}
        >
          <div className="brand-logo-icon">S</div>
          <span className="brand-logo-text">
            StreetCraft <span className="brand-badge-pill">AI STUDIO</span>
          </span>
        </div>

        <nav className="header-nav-links">
          {!isAppView ? (
            <>
              <button
                className={`nav-item ${currentRoute === 'home' ? 'active' : ''}`}
                onClick={() => navigate('home')}
              >
                Studio
              </button>
              <button
                className={`nav-item ${currentRoute === 'free-tool' ? 'active' : ''}`}
                onClick={() => navigate('free-tool')}
              >
                Free Generator
              </button>
              <button
                className={`nav-item ${currentRoute === 'pricing' ? 'active' : ''}`}
                onClick={() => navigate('pricing')}
              >
                Pricing
              </button>
            </>
          ) : (
            <>
              <button
                className={`nav-item ${currentRoute === 'app/dashboard' ? 'active' : ''}`}
                onClick={() => navigate('app/dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`nav-item ${currentRoute === 'app/create' ? 'active' : ''}`}
                onClick={() => navigate('app/create')}
              >
                Create Campaign
              </button>
              <button
                className={`nav-item ${currentRoute === 'app/campaigns' ? 'active' : ''}`}
                onClick={() => navigate('app/campaigns')}
              >
                Vault
              </button>
              <button
                className={`nav-item ${currentRoute === 'app/business' ? 'active' : ''}`}
                onClick={() => navigate('app/business')}
              >
                Store Memory
              </button>
            </>
          )}
        </nav>

        <div className="header-actions">
          {session.isAuthenticated ? (
            <>
              {usage && (
                <button className="usage-pill" onClick={onOpenUpgrade}>
                  <Zap size={13} />
                  <span><strong>{usage.remainingPacks}</strong> packs left</span>
                </button>
              )}

              {!isAppView ? (
                <button className="btn-primary" onClick={() => navigate('app/dashboard')}>
                  Open Studio <ArrowRight size={14} />
                </button>
              ) : (
                <button className="btn-ghost" onClick={onSignOut}>
                  <LogOut size={14} /> Sign out
                </button>
              )}
            </>
          ) : (
            <>
              <button className="btn-ghost" onClick={onOpenAuth}>
                Sign In
              </button>
              <button className="btn-primary" onClick={() => navigate('free-tool')}>
                Start Creating <ArrowRight size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
