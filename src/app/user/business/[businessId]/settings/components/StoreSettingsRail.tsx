'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, Clock, Tag, Phone, ArrowLeft } from 'lucide-react';
import { BusinessProfile } from '../../../../../../lib/server/business/getBusinessProfile';

interface StoreSettingsRailProps {
  business: { id: string; name: string; category: string };
  profile: BusinessProfile;
}

export function StoreSettingsRail({ business, profile: _profile }: StoreSettingsRailProps) {
  const pathname = usePathname();

  const navItems = [
    {
      segment: 'identity',
      icon: Store,
      title: 'Store Identity',
    },
    {
      segment: 'rhythm',
      icon: Clock,
      title: 'Hours & Rhythm',
    },
    {
      segment: 'offer',
      icon: Tag,
      title: 'Offer & Economics',
    },
    {
      segment: 'contact',
      icon: Phone,
      title: 'Contact & WhatsApp',
    },
  ];

  return (
    <aside className="account-rail">
      <div style={{ marginBottom: '14px' }}>
        <Link
          href={`/user/business/${encodeURIComponent(business.id)}/today`}
          className="btn-ghost"
          style={{
            fontSize: '12px',
            padding: '4px 8px',
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

      <div className="account-rail-section-label">STORE SETTINGS</div>

      <nav className="account-rail-nav" aria-label="Store Settings Navigation">
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
