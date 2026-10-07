'use client';

import React from 'react';
import { CampaignType } from '../../../../types/campaign';
import { CreateRadarOpportunity } from '../../../../lib/domain/create/createTypes';
import { ArrowRight, Clock, Sparkles, Flame, Calendar, Star, Zap, Compass } from 'lucide-react';

interface MomentStepProps {
  selectedType: CampaignType;
  onSelectType: (type: CampaignType) => void;
  onNext: () => void;
  radarOpportunities?: CreateRadarOpportunity[];
  onApplyOpportunity?: (opp: CreateRadarOpportunity) => void;
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

export function MomentStep({
  selectedType,
  onSelectType,
  onNext,
  radarOpportunities = [],
  onApplyOpportunity,
}: MomentStepProps) {
  return (
    <div className="card" style={{ padding: '32px' }}>
      {radarOpportunities.length > 0 && onApplyOpportunity && (
        <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Compass size={18} color="var(--color-primary)" />
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', margin: 0 }}>
              Storefront Intelligence Recommendations
            </h4>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', marginBottom: '16px' }}>
            Based on your store rhythm, operating hours, and upcoming calendar, our opportunity radar recommends:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {radarOpportunities.map((opp) => (
              <div
                key={opp.id}
                onClick={() => onApplyOpportunity(opp)}
                style={{
                  background: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--color-accent)',
                        background: 'var(--color-accent-subtle)',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-xs)',
                        fontWeight: 600,
                      }}
                    >
                      {opp.badge}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: opp.confidence === 'HIGH' ? '#059669' : '#d97706',
                        background: opp.confidence === 'HIGH' ? '#ecfdf5' : '#fffbeb',
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-xs)',
                        fontWeight: 600,
                      }}
                    >
                      {opp.confidence} ({opp.score})
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                    {opp.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', lineHeight: '1.4' }}>
                    {opp.summary}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--color-border-soft)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11.5px',
                    color: 'var(--color-primary)',
                    fontWeight: 600,
                  }}
                >
                  <span>Auto-fill strategy</span>
                  <ArrowRight size={13} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                border: '1.5px solid',
                borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                cursor: 'pointer',
                boxShadow: isSelected ? 'var(--shadow-paper)' : 'none',
                transition: 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                boxSizing: 'border-box',
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
