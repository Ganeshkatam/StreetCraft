'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, Clock, Tag, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { BusinessProfile } from '../../../../../../lib/server/business/getBusinessProfile';
import { computeStoreProgress } from '../../../../../../lib/domain/business/storeProgress';

interface StoreSettingsRailProps {
  business: { id: string; name: string; category: string };
  profile: BusinessProfile;
}

export function StoreSettingsRail({ business, profile }: StoreSettingsRailProps) {
  const pathname = usePathname();
  const storeInitial = (business.name || 'S').charAt(0).toUpperCase();
  const progress = computeStoreProgress(profile);

  const navItems = [
    {
      segment: 'identity',
      icon: Store,
      title: 'Store Identity',
      subtitle: `${business.category || 'Retail'} \u2022 ${profile.city || 'Local'}`,
    },
    {
      segment: 'rhythm',
      icon: Clock,
      title: 'Hours & Rhythm',
      subtitle: 'Peak & slow operating times',
    },
    {
      segment: 'offer',
      icon: Tag,
      title: 'Offer & Economics',
      subtitle: 'Pricing, ticket & growth targets',
    },
    {
      segment: 'contact',
      icon: Phone,
      title: 'Contact & WhatsApp',
      subtitle: profile.phone_whatsapp || 'Add phone number',
    },
  ];

  return (
    <aside className="account-rail">
      {/* Back to Today Workspace */}
      <div style={{ marginBottom: '16px' }}>
        <Link
          href={`/user/business/${encodeURIComponent(business.id)}/today`}
          className="btn-ghost"
          style={{
            fontSize: '12.5px',
            padding: '6px 10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--color-ink-muted)',
          }}
        >
          <ArrowLeft size={13} />
          <span>Back to Today</span>
        </Link>
      </div>

      {/* Store Profile Card */}
      <div className="account-rail-profile-card">
        <div className="account-rail-avatar-box">
          <div className="avatar-placeholder" style={{ width: '44px', height: '44px', fontSize: '18px' }}>
            {storeInitial}
          </div>
          <div>
            <div className="account-rail-user-name">{business.name}</div>
            <div className="account-rail-user-role">{business.category}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="account-rail-progress-box" style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
          <div className="account-rail-progress-labels">
            <span className="account-rail-progress-title">STORE PROFILE</span>
            <span className="account-rail-progress-pct">{progress.percentage}%</span>
          </div>
          <div className="account-rail-progress-bar-bg">
            <div
              className="account-rail-progress-bar-fill"
              style={{
                width: `${progress.percentage}%`,
                background: progress.percentage === 100 ? '#10b981' : 'var(--color-primary)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Domain Items */}
      <nav className="account-rail-nav">
        {navItems.map((item) => {
          const itemHref = `/user/business/${encodeURIComponent(business.id)}/settings/${item.segment}`;
          const isActive = pathname === itemHref || pathname?.startsWith(`${itemHref}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.segment}
              href={itemHref}
              className={`account-rail-item ${isActive ? 'active' : ''}`}
            >
              <div className="account-rail-item-icon">
                <Icon size={16} />
              </div>
              <div className="account-rail-item-text">
                <div className="account-rail-item-title">{item.title}</div>
                <div className="account-rail-item-subtitle">{item.subtitle}</div>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
