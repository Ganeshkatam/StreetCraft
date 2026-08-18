'use client';

import React from 'react';
import { Store, Clock, Tag, Phone, CheckCircle2 } from 'lucide-react';
import { BusinessProfile } from '../../../../lib/server/business/getBusinessProfile';
import { computeStoreProgress } from '../../../../lib/domain/business/storeProgress';

export type StoreTabId = 'identity' | 'rhythm' | 'offer' | 'contact';

interface StoreRailProps {
  business: { id: string; name: string; category: string };
  profile: BusinessProfile;
  activeTab: StoreTabId;
  onSelectTab: (tab: StoreTabId) => void;
}

export const StoreRail: React.FC<StoreRailProps> = ({
  business,
  profile,
  activeTab,
  onSelectTab,
}) => {
  const storeInitial = (business.name || 'S').charAt(0).toUpperCase();
  const progress = computeStoreProgress(profile);

  const navItems: Array<{
    id: StoreTabId;
    icon: React.ComponentType<{ size?: number }>;
    title: string;
    subtitle: string;
  }> = [
      {
        id: 'identity',
        icon: Store,
        title: 'Store Identity',
        subtitle: `${business.category || 'Retail'} \u2022 ${profile.city || 'Local'}`,
      },
      {
        id: 'rhythm',
        icon: Clock,
        title: 'Hours & Rhythm',
        subtitle: 'Peak & slow operating times',
      },
      {
        id: 'offer',
        icon: Tag,
        title: 'Offer & Economics',
        subtitle: 'Pricing, ticket & growth targets',
      },
      {
        id: 'contact',
        icon: Phone,
        title: 'Contact & WhatsApp',
        subtitle: profile.phone_whatsapp || 'Add phone number',
      },
    ];

  return (
    <aside className="account-rail">
      {/* Store Profile Summary Card */}
      <div className="account-rail-profile">
        <div className="account-rail-avatar">
          {profile.logo_url ? (
            <img
              src={profile.logo_url}
              alt={business.name || 'Storefront'}
              className="account-rail-avatar-img"
            />
          ) : (
            storeInitial
          )}
        </div>

        <div className="account-rail-profile-info">
          <div className="account-rail-name">
            {business.name || 'Storefront'}
          </div>

          <div className="account-rail-email">
            {business.category || 'Local Business'} {profile.city ? `\u2022 ${profile.city}` : ''}
          </div>
        </div>
      </div>

      {/* Store Setup Progress Card (Hidden automatically once 100% full) */}
      {!progress.isComplete && (
        <div className="account-progress-card">
          <div className="account-progress-header">
            <span className="account-progress-label">Store Setup</span>
            <span className="account-progress-pct">{progress.percentage}%</span>
          </div>
          <div className="account-progress-track">
            <div
              className="account-progress-fill"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <div className="account-progress-status-text">
            {progress.completedCount} of {progress.totalCount} parameters configured
          </div>
        </div>
      )}

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
                <Icon size={18} />
              </div>

              <div className="account-rail-item-text">
                <div className="account-rail-item-title">{item.title}</div>
                <div className="account-rail-item-subtitle">{item.subtitle}</div>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
