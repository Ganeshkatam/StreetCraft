import React, { useState } from 'react';
import { ChannelType, ChannelStatus } from '../types/campaign';
import { CHANNELS } from '../config/channels';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { Copy, Check, Newspaper, Image, MessageSquare, Send, MapPin, CheckCircle2, ExternalLink, QrCode } from 'lucide-react';

interface ChannelCardProps {
  channel: ChannelType;
  status: ChannelStatus;
  content: Record<string, unknown>;
  onCopyAll?: () => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  status,
  content,
}) => {
  const meta = CHANNELS[channel];
  const [copied, setCopied] = useState(false);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const getChannelIcon = () => {
    switch (channel) {
      case 'GOOGLE_BUSINESS':
        return <Newspaper size={16} />;
      case 'INSTAGRAM':
        return <Image size={16} />;
      case 'WHATSAPP':
        return <MessageSquare size={16} />;
      case 'IN_STORE_POSTER':
        return <Send size={16} />;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const renderChannelBody = () => {
    if (status === 'generating') {
      return (
        <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="spin-animate" style={{ display: 'inline-block', width: '28px', height: '28px', border: '2px solid rgba(16, 185, 129, 0.2)', borderTopColor: 'var(--accent-emerald)', borderRadius: '50%', marginBottom: '12px' }} />
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Generating & Validating {meta?.displayName}...</div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Injecting local cues and enforcing Zod character constraints</p>
        </div>
      );
    }

    if (status === 'pending') {
      return (
        <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          Queued in server-side generation sequence...
        </div>
      );
    }

    if (channel === 'GOOGLE_BUSINESS') {
      const headline = (content.headline as string) || '';
      const body = (content.body as string) || '';
      const ctaType = (content.ctaType as string) || 'Visit Us';
      const offerSummary = (content.offerSummary as string) || '';

      return (
        <div>
          {/* Realistic Google Search Update Card */}
          <div style={{ background: 'rgba(14, 17, 24, 0.95)', border: '1px solid rgba(66, 133, 244, 0.25)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 800 }}>G</div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>Google Business Profile Update</span>
                <span style={{ fontSize: '10px', background: 'rgba(66, 133, 244, 0.15)', color: '#60a5fa', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>VERIFIED LISTING</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Search & Maps</span>
            </div>

            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: '1.4' }}>
              {headline}
            </div>

            <div style={{ fontSize: '13.5px', color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
              {body}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <small style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>OFFER BADGE</small>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#60a5fa' }}>{offerSummary}</div>
              </div>
              <button
                className="btn-primary"
                style={{ padding: '7px 14px', fontSize: '12px', background: 'linear-gradient(180deg, #4285F4 0%, #2563EB 100%)', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}
                onClick={() => handleCopy(`${headline}\n\n${body}\n\nAction: ${ctaType}`)}
              >
                {ctaType} &rarr;
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (channel === 'INSTAGRAM') {
      const reelHook = (content.reelHook as string) || '';
      const caption = (content.caption as string) || '';
      const storyFrames = (content.storyFrames as string[]) || [];
      const localTags = (content.localTags as string[]) || [];

      return (
        <div>
          {/* Reel / Hook Frame */}
          <div style={{ background: 'linear-gradient(135deg, rgba(225, 48, 108, 0.1) 0%, rgba(14, 17, 24, 0.9) 100%)', border: '1px solid rgba(225, 48, 108, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#f472b6', letterSpacing: '0.08em' }}>
                REEL / VIRAL HOOK
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>0:03 Sec Audio Sync</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', fontStyle: 'italic' }}>
              "{reelHook}"
            </div>
          </div>

          {/* Story Frames Sequence */}
          {storyFrames.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <small style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
                3-PART STORY CARD SEQUENCE
              </small>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${storyFrames.length}, 1fr)`, gap: '8px' }}>
                {storyFrames.map((frame, idx) => (
                  <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px', fontSize: '11.5px', fontWeight: 600, color: '#e2e8f0', textAlign: 'center', lineHeight: '1.4' }}>
                    <span style={{ display: 'block', fontSize: '9px', fontFamily: 'var(--font-mono)', color: '#f472b6', marginBottom: '2px' }}>FRAME 0{idx + 1}</span>
                    {frame}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feed Caption */}
          <div className="channel-content-preview" style={{ background: 'rgba(14, 17, 24, 0.95)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>POST CAPTION</div>
            {caption}
          </div>

          {/* Local Discovery Hashtags */}
          <div>
            <small style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', display: 'block' }}>
              NEIGHBORHOOD DISCOVERY TAGS (CLICK TO COPY)
            </small>
            <div className="channel-tags">
              {localTags.map((tag, i) => (
                <button
                  key={i}
                  className="tag-pill"
                  style={{ cursor: 'pointer', transition: 'var(--transition-fast)' }}
                  onClick={() => handleCopyTag(tag)}
                  title="Click to copy hashtag"
                >
                  {copiedTag === tag ? 'Copied!' : tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (channel === 'WHATSAPP') {
      const broadcastMessage = (content.broadcastMessage as string) || '';
      const cta = (content.cta as string) || '';

      return (
        <div>
          {/* WhatsApp Dark Chat Bubble Frame */}
          <div style={{ background: 'linear-gradient(180deg, #0b141a 0%, #0d1a21 100%)', border: '1px solid rgba(37, 211, 102, 0.25)', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <MessageSquare size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>Official WhatsApp Broadcast</div>
                  <div style={{ fontSize: '10px', color: '#8696a0' }}>High Open-Rate Direct Message</div>
                </div>
              </div>
              <span style={{ fontSize: '10px', background: 'rgba(37, 211, 102, 0.15)', color: '#4ade80', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>DIRECT PUSH</span>
            </div>

            {/* Chat Bubble */}
            <div style={{ background: '#005c4b', borderRadius: '8px 8px 8px 2px', padding: '14px 16px', color: '#e9edef', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '12px', position: 'relative' }}>
              {broadcastMessage}
              <div style={{ textAlign: 'right', fontSize: '10px', color: '#8696a0', marginTop: '6px' }}>
                Delivered &bull; ✓✓
              </div>
            </div>

            {/* Counter Action Pill */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#cbd5e1' }}><strong>Redemption Hook:</strong> {cta}</span>
              <button className="btn-ghost" style={{ fontSize: '11px', color: '#4ade80', padding: '2px 8px' }} onClick={() => handleCopy(broadcastMessage)}>
                Copy Broadcast
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (channel === 'IN_STORE_POSTER') {
      const headline = (content.headline as string) || '';
      const subheading = (content.subheading as string) || '';
      const body = (content.body as string) || '';
      const cta = (content.cta as string) || '';

      return (
        <div>
          {/* Print-Ready Frame Mockup */}
          <div style={{ background: 'linear-gradient(135deg, #181d28 0%, #11141c 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', padding: '28px 24px', textAlign: 'center', position: 'relative', boxShadow: '0 12px 32px rgba(0,0,0,0.5)', marginBottom: '12px' }}>
            <div style={{ position: 'absolute', top: '14px', right: '16px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              A5 / TABLE TENT PRINT
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 800, color: 'var(--accent-amber)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
              {headline}
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '10px', lineHeight: '1.3' }}>
              {subheading}
            </h3>

            <p style={{ fontSize: '13.5px', color: '#cbd5e1', maxWidth: '420px', margin: '0 auto 16px', lineHeight: '1.6' }}>
              {body}
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: 'var(--font-mono)', color: '#ffffff' }}>
              <QrCode size={14} color="var(--accent-amber)" />
              <span>{cta}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const getFullCopyText = (): string => {
    if (channel === 'GOOGLE_BUSINESS') {
      return `${content.headline}\n\n${content.body}\n\nCTA: ${content.ctaType}`;
    }
    if (channel === 'INSTAGRAM') {
      const tags = Array.isArray(content.localTags) ? content.localTags.join(' ') : '';
      return `${content.caption}\n\n${tags}`;
    }
    if (channel === 'WHATSAPP') {
      return `${content.broadcastMessage}`;
    }
    if (channel === 'IN_STORE_POSTER') {
      return `${content.headline}\n${content.subheading}\n\n${content.body}\n\n${content.cta}`;
    }
    return '';
  };

  return (
    <div className="channel-card">
      <div>
        <div className="channel-card-header">
          <span className={`channel-name ${meta?.badgeClass || 'channel-badge-google'}`}>
            {getChannelIcon()} {meta?.displayName || channel}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CampaignStatusBadge status={status} size="sm" />
            {status === 'ready' && (
              <button
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => handleCopy(getFullCopyText())}
              >
                {copied ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                {copied ? 'Copied Pack' : 'Copy All'}
              </button>
            )}
          </div>
        </div>

        {renderChannelBody()}
      </div>

      <div className="channel-footer">
        <span className="char-counter">{meta?.description || 'Validated Schema'}</span>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: status === 'ready' ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
          {status === 'ready' ? 'SCHEMA VERIFIED' : status.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
