import React from 'react';
import { UserSession } from '../types/business';
import { UsageSummary } from '../types/billing';
import { ArrowRight, LogOut, LogIn } from 'lucide-react';

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
        <button
          onClick={() => navigate(session.isAuthenticated ? 'app/dashboard' : 'home')}
          style={{ display: 'flex', alignItems: 'baseline' }}
        >
          <span className="brand-wordmark">
            STREETCRAFT
            <span>Local Studio</span>
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
              How it works
            </button>
            <button
              className={`nav-item ${currentRoute === 'free-tool' ? 'active' : ''}`}
              onClick={() => navigate('free-tool')}
            >
              Free tool
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
              Today
            </button>
            <button
              className={`nav-item ${currentRoute === 'app/create' ? 'active' : ''}`}
              onClick={() => navigate('app/create')}
            >
              Create
            </button>
            <button
              className={`nav-item ${currentRoute === 'app/campaigns' ? 'active' : ''}`}
              onClick={() => navigate('app/campaigns')}
            >
              Campaigns
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
              <div className="usage-pill" onClick={onOpenUpgrade} style={{ cursor: 'pointer' }}>
                <span>{usage.remainingPacks} packs left</span>
              </div>
            )}

            {!isAppView ? (
              <button className="btn-primary" onClick={() => navigate('app/dashboard')}>
                Open Workspace <ArrowRight size={13} />
              </button>
            ) : (
              <button className="btn-ghost" onClick={onSignOut}>
                <LogOut size={13} /> Sign out
              </button>
            )}
          </>
        ) : (
          <>
            <button className="btn-ghost" onClick={onOpenAuth}>
              Sign In
            </button>
            <button className="btn-primary" onClick={() => navigate('free-tool')}>
              Start creating &rarr;
            </button>
          </>
        )}
      </div>
    </header>
  );
};
