import React from 'react';
import type { CampaignTimelineItem } from '../../../../../../lib/domain/report/reportTypes';
import Link from 'next/link';
import { Calendar, FileText, ArrowRight } from 'lucide-react';

interface CampaignTimelineProps {
  timeline: CampaignTimelineItem[];
  businessId: string;
}

export function CampaignTimeline({ timeline, businessId }: CampaignTimelineProps) {
  if (timeline.length === 0) {
    return (
      <div
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '36px 24px',
          textAlign: 'center',
          marginBottom: '28px',
        }}
      >
        <Calendar size={28} color="var(--color-ink-muted)" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-ink)', margin: '0 0 6px' }}>
          No Campaigns Created Yet
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--color-ink-muted)', maxWidth: '420px', margin: '0 auto 20px' }}>
          Generate your first synchronized campaign to begin tracking touchpoint deployment history.
        </p>
        <Link
          href={`/user/create?biz=${businessId}`}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13.5px', padding: '10px 20px' }}
        >
          Create First Campaign
        </Link>
      </div>
    );
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
      case 'COMPLETED':
        return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' };
      case 'ARCHIVED':
        return { bg: '#F3F4F6', color: '#4B5563', border: '#E5E7EB' };
      default:
        return { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
    }
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', margin: '0 0 4px' }}>
            Recent Campaign Ledger
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--color-ink-muted)', margin: 0 }}>
            Chronological audit of recent campaign packs and operational notes.
          </p>
        </div>

        <Link
          href={`/user/campaigns?biz=${businessId}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
        >
          <span>View All Campaigns</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {timeline.map((item) => {
          const badgeStyle = getStatusBadgeStyle(item.status);
          const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 18px',
                background: 'var(--color-bg, #F9FAF7)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    background: badgeStyle.bg,
                    color: badgeStyle.color,
                    border: `1px solid ${badgeStyle.border}`,
                  }}
                >
                  {item.status}
                </div>

                <div>
                  <Link
                    href={`/user/campaigns/${item.id}?biz=${businessId}`}
                    style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', textDecoration: 'none' }}
                  >
                    {item.title}
                  </Link>
                  <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>{formattedDate}</span>
                    <span>&bull;</span>
                    <span>{item.type.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {item.hasPerformanceNotes && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-primary)' }}>
                    <FileText size={13} />
                    <span>Notes recorded</span>
                  </div>
                )}

                <Link
                  href={`/user/campaigns/${item.id}?biz=${businessId}`}
                  className="btn-ghost"
                  style={{ fontSize: '12.5px', padding: '6px 12px' }}
                >
                  View Details &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
