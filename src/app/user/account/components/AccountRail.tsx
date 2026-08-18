'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Store, Bell, Lock, CreditCard } from 'lucide-react';

interface AccountRailProps {
  fullName: string;
  email: string;
  avatarUrl: string | null;
}

export function AccountRail({ fullName: _fullName, email: _email, avatarUrl: _avatarUrl }: AccountRailProps) {
  const pathname = usePathname();

  const navItems = [
    {
      id: 'identity',
      route: '/user/account/identity',
      icon: User,
      title: 'Identity',
    },
    {
      id: 'storefronts',
      route: '/user/account/storefronts',
      icon: Store,
      title: 'Storefronts',
    },
    {
      id: 'notifications',
      route: '/user/account/notifications',
      icon: Bell,
      title: 'Notifications',
    },
    {
      id: 'security',
      route: '/user/account/security',
      icon: Lock,
      title: 'Security',
    },
    {
      id: 'plan',
      route: '/user/account/plan',
      icon: CreditCard,
      title: 'Plan & Usage',
    },
  ];

  return (
    <aside className="account-rail">
      <div className="account-rail-section-label">ACCOUNT SETTINGS</div>

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
              <span className="account-rail-item-icon-wrapper">
                <Icon size={15} />
              </span>
              <span className="account-rail-item-title">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
