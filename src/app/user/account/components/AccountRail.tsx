'use client';

import React from 'react';
import { User, Store, Bell, Lock, CreditCard, LogOut, ChevronRight } from 'lucide-react';
import { AccountUserProfile, AccountBusinessMembership, AccountEntitlement } from '../../../../lib/server/account/getAccountProfile';

export type AccountTabId = 'identity' | 'stores' | 'notifications' | 'security' | 'plan';

interface AccountRailProps {
  profile: AccountUserProfile;
  businesses: AccountBusinessMembership[];
  entitlement: AccountEntitlement;
  activeTab: AccountTabId;
  onSelectTab: (tab: AccountTabId) => void;
}

export const AccountRail: React.FC<AccountRailProps> = ({
  profile,
  businesses,
  entitlement,
  activeTab,
  onSelectTab,
}) => {
  const userInitial = (profile.fullName || profile.email || 'U').charAt(0).toUpperCase();

  const businessCountText = businesses.length === 1 ? '1 storefront' : `${businesses.length} storefronts`;
  const businessCountBadge = businesses.length < 10 ? `0${businesses.length}` : `${businesses.length}`;
  const planSubtitle = entitlement.planName ? `${entitlement.planName} \u2022 Active` : 'Neighborhood Starter \u2022 Free';

  const navItems: Array<{
    id: AccountTabId;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    title: string;
    subtitle: string;
    count?: string;
  }> = [
    {
      id: 'identity',
      icon: User,
      title: 'Identity',
      subtitle: 'Name & contact',
    },
    {
      id: 'stores',
      icon: Store,
      title: 'Storefronts',
      subtitle: businessCountText,
      count: businessCountBadge,
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      subtitle: '3 preferences',
      count: '03',
    },
    {
      id: 'security',
      icon: Lock,
      title: 'Security',
      subtitle: 'Password & session',
    },
    {
      id: 'plan',
      icon: CreditCard,
      title: 'Plan & usage',
      subtitle: planSubtitle,
    },
  ];

  return (
    <aside className="account-rail">
      {/* User Profile Summary Card */}
      <div className="account-rail-profile">
        <div className="account-rail-avatar">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.fullName || 'User'}
              className="account-rail-avatar-img"
            />
          ) : (
            userInitial
          )}
        </div>

        <div className="account-rail-name">
          {profile.fullName || 'User'}
        </div>

        <div className="account-rail-email">
          {profile.email}
        </div>
      </div>

      <div className="account-rail-divider" />

      {/* Navigation Items */}
      <nav className="account-rail-nav">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`account-rail-item ${isActive ? 'active' : ''}`}
            >
              <div className="account-rail-item-icon-wrapper">
                <Icon size={17} />
              </div>

              <div className="account-rail-item-text">
                <div className="account-rail-item-title">
                  {item.title}
                </div>
                <div className="account-rail-item-subtitle">
                  {item.subtitle}
                </div>
              </div>

              {isActive ? (
                <div className="account-rail-item-arrow">
                  <ChevronRight size={15} />
                </div>
              ) : item.count ? (
                <div className="account-rail-item-count">
                  {item.count}
                </div>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Sign Out Action */}
      <form action="/auth/signout" method="POST" className="account-rail-signout-form">
        <button type="submit" className="account-rail-signout-btn">
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </form>
    </aside>
  );
};
