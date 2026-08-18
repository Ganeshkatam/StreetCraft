import React from 'react';
import type { CampaignStatusCounts } from '../../../../../../lib/domain/report/reportTypes';
import { Layers, Send, CheckCheck, Archive, Clock } from 'lucide-react';

interface CampaignPerformanceProps {
  activity: CampaignStatusCounts;
}

export function CampaignPerformance({ activity }: CampaignPerformanceProps) {
  const cards = [
    {
      label: 'Total Generated',
      value: activity.total,
      icon: Layers,
      color: 'var(--color-primary)',
      sub: 'All-time campaigns created',
    },
    {
      label: 'Published',
      value: activity.published,
      icon: Send,
      color: '#2563EB',
      sub: 'Broadcasted to channels',
    },
    {
      label: 'Completed',
      value: activity.completed,
      icon: CheckCheck,
      color: '#059669',
      sub: 'Promotion cycle finished',
    },
    {
      label: 'Draft / Ready',
      value: activity.draft + activity.ready,
      icon: Clock,
      color: '#D97706',
      sub: 'Awaiting operator broadcast',
    },
    {
      label: 'Archived',
      value: activity.archived,
      icon: Archive,
      color: 'var(--color-ink-muted)',
      sub: 'Preserved in historical vault',
    },
  ];

  return (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', margin: '0 0 4px' }}>
          Campaign Lifecycle Activity
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', margin: 0 }}>
          Structured breakdown of all campaign generations and execution states in your store vault.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}
      >
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-ink-muted)', textTransform: 'uppercase' }}>
                  {c.label}
                </span>
                <Icon size={16} color={c.color} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}>
                {c.value}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)' }}>
                {c.sub}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
