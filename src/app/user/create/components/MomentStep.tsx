'use client';

import React from 'react';
import { CampaignType } from '../../../../types/campaign';
import { ArrowRight, Clock, Sparkles, Flame, Calendar, Star, Zap } from 'lucide-react';

interface MomentStepProps {
  selectedType: CampaignType;
  onSelectType: (type: CampaignType) => void;
  onNext: () => void;
}

const MOMENTS: Array<{
  type: CampaignType;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}> = [
  {
    type: 'WEEKDAY_BOOST',
    title: 'Quiet Weekday Afternoon',
    desc: 'Promote slow 3–6 PM hours with pairing perks and counter combos',
    icon: Clock,
  },
  {
    type: 'MENU_LAUNCH',
    title: 'New Dish or Item Drop',
    desc: 'Spotlight a newly introduced signature item, brew, or seasonal recipe',
    icon: Sparkles,
  },
  {
    type: 'WEEKEND_MAGNET',
    title: 'Weekend Rush Special',
    desc: 'Capture Saturday & Sunday brunch crowds, table reservations & family visits',
    icon: Flame,
  },
  {
    type: 'FESTIVAL_SPECIAL',
    title: 'Holiday or Local Festival',
    desc: 'Celebrate regional festivities, festive gift packs, and holiday specials',
    icon: Calendar,
  },
  {
    type: 'REVIEW_SPOTLIGHT',
    title: 'Re-engage Inactive Regulars',
    desc: 'Turn 5-star neighborhood customer love into a reason to return this week',
    icon: Star,
  },
  {
    type: 'WIN_BACK_REGULARS',
    title: 'Win Back Inactive Guests',
    desc: 'Special return invitation for regulars who haven’t visited recently',
    icon: Zap,
  },
];

export function MomentStep({ selectedType, onSelectType, onNext }: MomentStepProps) {
  return (
    <div className="card" style={{ padding: '32px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', marginBottom: '6px' }}>
        What is happening at your store?
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px' }}>
        Select the store trigger or commercial moment you want to promote across your neighborhood.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {MOMENTS.map((m) => {
          const isSelected = selectedType === m.type;
          const Icon = m.icon;

          return (
            <div
              key={m.type}
              onClick={() => onSelectType(m.type)}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-sm)',
                background: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                cursor: 'pointer',
                boxShadow: isSelected ? 'var(--shadow-paper)' : 'none',
                transition: 'var(--motion-fast)',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: isSelected ? 'var(--color-primary)' : 'var(--color-surface-raised)',
                  color: isSelected ? '#ffffff' : 'var(--color-primary)',
                  flexShrink: 0,
                }}
              >
                <Icon size={18} />
              </div>

              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  {m.title}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.45' }}>
                  {m.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
        <button
          type="button"
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          onClick={onNext}
        >
          <span>Continue to Primary Goal</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
