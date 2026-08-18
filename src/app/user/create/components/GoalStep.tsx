'use client';

import React from 'react';
import { CampaignObjective } from '../../../../types/campaign';
import { ArrowRight, ArrowLeft, Users, ShoppingBag, Sun, Gift, Repeat, CalendarCheck } from 'lucide-react';

interface GoalStepProps {
  selectedObjective: CampaignObjective;
  onSelectObjective: (objective: CampaignObjective) => void;
  onBack: () => void;
  onNext: () => void;
}

const OBJECTIVES: Array<{
  objective: CampaignObjective;
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}> = [
  {
    objective: 'MORE_WALK_INS',
    title: 'Drive Store Walk-Ins',
    desc: 'Maximize immediate customer footfall and counter orders this week',
    icon: Users,
  },
  {
    objective: 'PROMOTE_PRODUCT',
    title: 'Trial a Signature Item',
    desc: 'Encourage customers to taste and review a new or hero menu creation',
    icon: ShoppingBag,
  },
  {
    objective: 'MORE_ORDERS',
    title: 'Fill Afternoon & Slow Hours',
    desc: 'Smooth out low-traffic valley hours with time-locked incentives',
    icon: Sun,
  },
  {
    objective: 'FESTIVAL_RUSH',
    title: 'Festive & Celebration Orders',
    desc: 'Capture seasonal holiday gifting, party orders & special bookings',
    icon: Gift,
  },
  {
    objective: 'REPEAT_VISITS',
    title: 'Boost Repeat Visits',
    desc: 'Incentivize second and third visits from past neighborhood guests',
    icon: Repeat,
  },
  {
    objective: 'MORE_BOOKINGS',
    title: 'Table & Advance Bookings',
    desc: 'Secure advance table reservations and weekend group pre-orders',
    icon: CalendarCheck,
  },
];

export function GoalStep({ selectedObjective, onSelectObjective, onBack, onNext }: GoalStepProps) {
  return (
    <div className="card" style={{ padding: '32px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', marginBottom: '6px' }}>
        What is your primary goal?
      </h3>
      <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', marginBottom: '24px' }}>
        This shapes the headline tone and calls-to-action generated across all 4 channels.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {OBJECTIVES.map((obj) => {
          const isSelected = selectedObjective === obj.objective;
          const Icon = obj.icon;

          return (
            <div
              key={obj.objective}
              onClick={() => onSelectObjective(obj.objective)}
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
                  {obj.title}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.45' }}>
                  {obj.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
        <button
          type="button"
          className="btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          onClick={onBack}
        >
          <ArrowLeft size={15} />
          <span>Back to Store Moment</span>
        </button>

        <button
          type="button"
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          onClick={onNext}
        >
          <span>Continue to Offer &amp; Timing</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
