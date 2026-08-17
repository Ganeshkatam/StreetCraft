import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireAuth?: boolean;
  requireBusiness?: boolean;
  requireRole?: 'owner' | 'admin' | 'member';
  anonymousOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireBusiness = true,
  requireRole,
  anonymousOnly = false,
}) => {
  const location = useLocation();
  const { session, loading } = useAuth();

  // Show clean editorial loading state while session hydrates
  if (loading) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-page)',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            border: '2.5px solid var(--color-border)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <div
          style={{
            fontSize: '13px',
            color: 'var(--color-ink-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Verifying store credentials...
        </div>
      </div>
    );
  }

  // 1. Anonymous-only routes (e.g. /login, /signup)
  if (anonymousOnly) {
    if (session.isAuthenticated && session.userId) {
      if (session.activeBusinessId) {
        return <Navigate to="/app/today" replace />;
      }
      return <Navigate to="/setup" replace />;
    }
    return children;
  }

  // 2. Authentication check
  if (requireAuth && (!session.isAuthenticated || !session.userId)) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 3. Business existence check
  if (requireBusiness && !session.activeBusinessId) {
    // If not already on /setup, redirect to setup
    if (location.pathname !== '/setup' && location.pathname !== '/onboarding') {
      return <Navigate to="/setup" replace />;
    }
  }

  // 4. Role authorization check
  if (requireRole && session.role) {
    const rolesHierarchy: Record<string, number> = {
      member: 1,
      admin: 2,
      owner: 3,
    };
    const userRoleRank = rolesHierarchy[session.role] || 0;
    const requiredRoleRank = rolesHierarchy[requireRole] || 0;

    if (userRoleRank < requiredRoleRank) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};
