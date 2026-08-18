import React from 'react';
import { Mail, CreditCard, Handshake, Users } from 'lucide-react';

const channels = [
  {
    icon: Mail,
    title: 'Product Support',
    email: 'support@streetcraft.in',
    desc: 'Questions about campaign generations, storefront setup, or workspace tools.',
  },
  {
    icon: CreditCard,
    title: 'Billing & Quotas',
    email: 'billing@streetcraft.in',
    desc: 'Questions regarding plan upgrades, subscription invoices, or monthly allocations.',
  },
  {
    icon: Handshake,
    title: 'Partnerships & Integrations',
    email: 'partners@streetcraft.in',
    desc: 'Agency collaboration, platform integrations, and local retail partnerships.',
  },
  {
    icon: Users,
    title: 'General & Founder Desk',
    email: 'founder@streetcraft.in',
    desc: 'Strategic inquiries, direct feedback, or anything not covered above.',
  },
];

export function ContactChannels() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--color-ink-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
        DIRECT CHANNELS
      </div>

      {channels.map((ch, idx) => {
        const Icon = ch.icon;
        return (
          <div key={idx} className="contact-channel-item">
            <div className="contact-channel-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={16} color="var(--color-primary)" />
                <span className="contact-channel-title">{ch.title}</span>
              </div>
              <a href={`mailto:${ch.email}`} className="contact-channel-email">
                {ch.email}
              </a>
            </div>
            <p className="contact-channel-desc">{ch.desc}</p>
          </div>
        );
      })}
    </div>
  );
}
