import React from 'react';
import type { ChannelCoverageViewModel } from '../../../../../../lib/domain/report/reportTypes';
import { Search, Camera, MessageSquare, Printer, CheckCircle2 } from 'lucide-react';

interface ChannelCoverageProps {
  coverage: ChannelCoverageViewModel;
}

export function ChannelCoverage({ coverage }: ChannelCoverageProps) {
  const channels = [
    {
      item: coverage.googleBusiness,
      icon: Search,
      color: '#4285F4',
      description: 'Search & Google Maps local SEO presence',
    },
    {
      item: coverage.instagram,
      icon: Camera,
      color: '#E1306C',
      description: 'Reel concepts, Story frames, and hashtags',
    },
    {
      item: coverage.whatsapp,
      icon: MessageSquare,
      color: '#25D366',
      description: 'VIP broadcast text and flash drop urgency',
    },
    {
      item: coverage.inStorePoster,
      icon: Printer,
      color: '#8B5CF6',
      description: 'A4/A5 counter cards & table tents',
    },
  ];

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '28px',
        marginBottom: '28px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', margin: '0 0 4px' }}>
            4-Touchpoint Distribution Matrix
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', margin: 0 }}>
            Aggregated touchpoint output coverage compiled across all campaigns.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-subtle)', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}>
          <CheckCircle2 size={15} color="var(--color-primary)" />
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-primary)' }}>
            {coverage.averageOutputsPerCampaign} / 4 Avg Channels per Pack
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {channels.map((ch, idx) => {
          const Icon = ch.icon;
          return (
            <div
              key={idx}
              style={{
                background: 'var(--color-bg, #F9FAF7)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={16} color={ch.color} />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>
                    {ch.item.label}
                  </span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}>
                  {ch.item.count}
                </span>
              </div>

              <div style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)', lineHeight: '1.4' }}>
                {ch.description}
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '5px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                <div
                  style={{
                    width: `${ch.item.percentage}%`,
                    height: '100%',
                    background: 'var(--color-primary)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              <div style={{ fontSize: '11px', color: 'var(--color-ink-muted)', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                {ch.item.percentage}% campaign presence
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
