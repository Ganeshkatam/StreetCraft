import React from 'react';
import { UserSession } from '../types/business';
import { UsageSummary } from '../types/billing';
import { UsageMeter } from './UsageMeter';
import { Sparkles, LogOut, LogIn, Store } from 'lucide-react';

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
      <div className="brand-wrapper">
        <button className="brand-wrapper" onClick={() => navigate(session.isAuthenticated ? 'app/dashboard' : 'home')}>
          <div className="brand-badge">S</div>
          <span className="brand-title">
            StreetCraft<span>AI</span>
          </span>
        </button>
      </div>

      <nav className="nav-links">
        {!isAppView ? (
          <>
            <button
              className={`nav-item ${currentRoute === 'home' ? 'active' : ''}`}
              onClick={() => navigate('home')}
            >
              Home
            </button>
            <button
              className={`nav-item ${currentRoute === 'free-tool' ? 'active' : ''}`}
              onClick={() => navigate('free-tool')}
            >
              Free Campaign Refiner
              <span className="nav-badge-free">Instant</span>
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
              Campaign Vault
            </button>
            <button
              className={`nav-item ${currentRoute === 'app/business' ? 'active' : ''}`}
              onClick={() => navigate('app/business')}
            >
              Business Memory
            </button>
          </>
        )}
      </nav>

      <div className="header-actions">
        {session.isAuthenticated ? (
          <>
            <UsageMeter usage={usage} onUpgrade={onOpenUpgrade} compact />

            {!isAppView ? (
              <button className="btn-primary" onClick={() => navigate('app/dashboard')}>
                <Sparkles size={14} /> Open Studio
              </button>
            ) : (
              <button
                className="btn-ghost"
                onClick={onSignOut}
                title="Log out"
              >
                <LogOut size={14} /> Sign out
              </button>
            )}
          </>
        ) : (
          <>
            <button className="btn-secondary" onClick={onOpenAuth}>
              <LogIn size={14} /> Sign In
            </button>
            <button className="btn-primary" onClick={() => navigate('free-tool')}>
              <Sparkles size={14} /> Try Free Refiner
            </button>
          </>
        )}
      </div>
    </header>
  );
};
