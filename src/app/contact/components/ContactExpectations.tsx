import React from 'react';
import { Inbox, Search, MailCheck } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: Inbox,
    title: 'Message Received',
    desc: 'Your inquiry is routed directly to the appropriate team desk without ticket bot queues.',
  },
  {
    step: '02',
    icon: Search,
    title: 'Store Context Review',
    desc: 'We review your storefront details and campaign context if applicable.',
  },
  {
    step: '03',
    icon: MailCheck,
    title: 'Direct Response',
    desc: 'We respond directly to your provided email address with actionable guidance.',
  },
];

export function ContactExpectations() {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '20px',
      }}
    >
      <div
        style={{
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'var(--color-ink-muted)',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}
      >
        WHAT HAPPENS NEXT
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.step} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                <Icon size={16} />
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '2px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', marginRight: '6px' }}>{s.step}</span>
                  {s.title}
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', lineHeight: '1.45' }}>
                  {s.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
