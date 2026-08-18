'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Store, Bell, Lock, CreditCard, ChevronRight } from 'lucide-react';

interface AccountRailProps {
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export function AccountRail({ fullName, email, avatarUrl }: AccountRailProps) {
  const pathname = usePathname();
  const userInitial = (fullName || email || 'U').charAt(0).toUpperCase();

  const navItems = [
    {
      id: 'identity',
      route: '/user/account/identity',
      stepNumber: '01',
      icon: User,
      title: 'Identity',
      subtitle: 'Name & contact details',
    },
    {
      id: 'storefronts',
      route: '/user/account/storefronts',
      stepNumber: '02',
      icon: Store,
      title: 'Storefronts',
      subtitle: 'Connected businesses',
    },
    {
      id: 'notifications',
      route: '/user/account/notifications',
      stepNumber: '03',
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Alerts & digests',
    },
    {
      id: 'security',
      route: '/user/account/security',
      stepNumber: '04',
      icon: Lock,
      title: 'Security',
      subtitle: 'Password & credentials',
    },
    {
      id: 'plan',
      route: '/user/account/plan',
      stepNumber: '05',
      icon: CreditCard,
      title: 'Plan & Usage',
      subtitle: 'Subscription & limits',
    },
  ];

  return (
    <aside className="account-rail">
      {/* User Profile Summary Header */}
      <div className="account-rail-profile">
        <div className="account-rail-avatar">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName || 'User'}
              className="account-rail-avatar-img"
            />
          ) : (
            userInitial
          )}
        </div>

        <div className="account-rail-profile-info">
          <div className="account-rail-name">
            {fullName || 'Account User'}
          </div>
          <div className="account-rail-email">
            {email}
          </div>
        </div>
      </div>

      <div className="account-rail-divider" />

      {/* Navigation Items */}
      <nav className="account-rail-nav" aria-label="Account Settings Navigation">
        {navItems.map((item) => {
          const isActive = pathname === item.route || (item.id === 'identity' && pathname === '/user/account');
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.route}
              className={`account-rail-item ${isActive ? 'active' : ''}`}
            >
              <div className="account-rail-item-left">
                <div className="account-rail-item-icon">
                  <Icon size={16} />
                </div>
                <div className="account-rail-item-content">
                  <div className="account-rail-item-title">
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--color-ink-muted)', marginRight: '6px' }}>
                      {item.stepNumber}
                    </span>
                    {item.title}
                  </div>
                  <div className="account-rail-item-subtitle">{item.subtitle}</div>
                </div>
              </div>

              <div className="account-rail-item-right">
                <ChevronRight size={13} className="account-rail-item-arrow" />
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
