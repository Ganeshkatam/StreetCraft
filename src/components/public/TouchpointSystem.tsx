import React from 'react';
import type { TouchpointSynergyContent } from '../../content/types';
import { Layers } from 'lucide-react';

interface TouchpointSystemProps {
  content: TouchpointSynergyContent;
}

export function TouchpointSystem({ content }: TouchpointSystemProps) {
  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #1A231E 0%, #111814 100%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '48px 40px',
        marginBottom: '80px',
        color: '#FFFFFF',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#34D399',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          <Layers size={13} />
          <span>{content.eyebrow}</span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            color: '#FFFFFF',
            lineHeight: '1.2',
            margin: '0 0 12px',
            letterSpacing: '-0.015em',
          }}
        >
          {content.title}
        </h2>

        <p style={{ fontSize: '15.5px', color: '#9CA3AF', lineHeight: '1.6', margin: 0 }}>
          {content.subtitle}
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}
      >
        {content.channels.map((chan, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#F3F4F6' }}>
                {chan.channel}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  color: '#34D399',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                }}
              >
                {chan.role}
              </span>
            </div>
            <p style={{ fontSize: '13.5px', color: '#9CA3AF', lineHeight: '1.55', margin: 0 }}>
              {chan.outputDescription}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
