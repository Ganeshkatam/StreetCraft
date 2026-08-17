import React, { useState, useRef, useEffect } from 'react';
import { ChannelType, ChannelStatus } from '../types/campaign';
import { CHANNELS } from '../config/channels';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { Copy, Check, Newspaper, Image, MessageSquare, Send, QrCode, Download, Printer, FileText, ChevronDown } from 'lucide-react';
import { downloadChannelFile, triggerPrintPoster } from '../utils/exportUtils';

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
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };
    if (showDownloadMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDownloadMenu]);

  const getChannelIcon = () => {
    switch (channel) {
      case 'GOOGLE_BUSINESS':
        return <Newspaper size={16} color="var(--color-primary)" />;
      case 'INSTAGRAM':
        return <Image size={16} color="var(--color-accent)" />;
      case 'WHATSAPP':
        return <MessageSquare size={16} color="var(--color-primary)" />;
      case 'IN_STORE_POSTER':
        return <Send size={16} color="var(--color-accent)" />;
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
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="spin-animate" style={{ display: 'inline-block', width: '28px', height: '28px', border: '2px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', marginBottom: '12px' }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>Creating {meta?.displayName}...</div>
          <p style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '4px' }}>Formatting proof with your business details...</p>
        </div>
      );
    }

    if (status === 'pending') {
      return (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--color-ink-muted)', fontSize: '13px' }}>
          Queued in generation sequence...
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
          <div style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '18px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)' }}>Google Business Profile Update</span>
              <span style={{ fontSize: '10.5px', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-mono)' }}>VERIFIED</span>
            </div>

            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '8px', lineHeight: '1.4' }}>
              {headline}
            </div>

            <div style={{ fontSize: '13px', color: 'var(--color-ink-soft)', lineHeight: '1.65', whiteSpace: 'pre-wrap', marginBottom: '14px' }}>
              {body}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface)', padding: '10px 14px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>{offerSummary}</span>
              <button
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
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
          <div style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', marginBottom: '14px' }}>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase' }}>
              REEL / STORY HOOK
            </span>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', marginTop: '4px', fontStyle: 'italic' }}>
              "{reelHook}"
            </div>
          </div>

          {storyFrames.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${storyFrames.length}, 1fr)`, gap: '8px', marginBottom: '14px' }}>
              {storyFrames.map((frame, idx) => (
                <div key={idx} style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', padding: '10px', fontSize: '11.5px', color: 'var(--color-ink)', lineHeight: '1.4' }}>
                  <span style={{ display: 'block', fontSize: '9.5px', fontFamily: 'var(--font-mono)', color: 'var(--color-accent)', marginBottom: '2px' }}>STORY 0{idx + 1}</span>
                  {frame}
                </div>
              ))}
            </div>
          )}

          <div className="channel-content-preview">
            <div style={{ fontSize: '11px', color: 'var(--color-ink-muted)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>POST CAPTION</div>
            {caption}
          </div>

          {localTags.length > 0 && (
            <div className="channel-tags">
              {localTags.map((tag, i) => (
                <button
                  key={i}
                  className="channel-tag"
                  onClick={() => handleCopyTag(tag)}
                  title="Click to copy hashtag"
                >
                  {copiedTag === tag ? 'Copied' : tag}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (channel === 'WHATSAPP') {
      const broadcastMessage = (content.broadcastMessage as string) || '';
      const cta = (content.cta as string) || '';

      return (
        <div>
          <div style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-ink)' }}>WhatsApp Broadcast</span>
              <span style={{ fontSize: '10px', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 'var(--radius-xs)', fontFamily: 'var(--font-mono)' }}>DIRECT PUSH</span>
            </div>

            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xs)', padding: '12px 14px', color: 'var(--color-ink)', fontSize: '13.5px', lineHeight: '1.6', whiteSpace: 'pre-wrap', marginBottom: '10px' }}>
              {broadcastMessage}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--color-ink-muted)' }}>
              <span>CTA: <strong style={{ color: 'var(--color-ink)' }}>{cta}</strong></span>
              <button className="btn-ghost" style={{ fontSize: '11px', color: 'var(--color-primary)' }} onClick={() => handleCopy(broadcastMessage)}>
                Copy text
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
          <div style={{ background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '20px', textAlign: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {headline}
            </span>

            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--color-ink)', margin: '6px 0 8px' }}>
              {subheading}
            </h4>

            <p style={{ fontSize: '13px', color: 'var(--color-ink-soft)', maxWidth: '400px', margin: '0 auto 14px', lineHeight: '1.5' }}>
              {body}
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '6px 14px', borderRadius: 'var(--radius-xs)', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--color-ink)' }}>
              <QrCode size={13} color="var(--color-accent)" />
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
      <div className="channel-card-header">
        <span className="channel-name">
          {getChannelIcon()} {meta?.displayName || channel}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CampaignStatusBadge status={status} size="sm" />
          {status === 'ready' && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', position: 'relative' }}>
              {channel === 'IN_STORE_POSTER' && (
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11.5px', padding: '4px 10px' }}
                  onClick={triggerPrintPoster}
                  title="Print counter card or save as PDF"
                >
                  <Printer size={12} /> Print
                </button>
              )}

              <div className="dropdown-container" ref={downloadMenuRef}>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '11.5px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  title="Download options"
                  aria-expanded={showDownloadMenu}
                >
                  <Download size={12} />
                  <span>Download</span>
                  <ChevronDown
                    size={11}
                    style={{
                      opacity: 0.65,
                      transform: showDownloadMenu ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                </button>

                {showDownloadMenu && (
                  <div className="dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        downloadChannelFile(channel, content, 'txt');
                        setShowDownloadMenu(false);
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={13} color="var(--color-primary)" />
                        <span>Plain Text</span>
                      </span>
                      <span className="dropdown-item-badge">.txt</span>
                    </button>

                    <button
                      className="dropdown-item"
                      onClick={() => {
                        downloadChannelFile(channel, content, 'md');
                        setShowDownloadMenu(false);
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={13} color="var(--color-accent)" />
                        <span>Markdown</span>
                      </span>
                      <span className="dropdown-item-badge">.md</span>
                    </button>

                    {channel === 'IN_STORE_POSTER' && (
                      <button
                        className="dropdown-item"
                        onClick={() => {
                          setShowDownloadMenu(false);
                          triggerPrintPoster();
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Printer size={13} color="var(--color-ink)" />
                          <span>Print / Save PDF</span>
                        </span>
                        <span className="dropdown-item-badge">Print</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                className="btn-secondary"
                style={{ fontSize: '11.5px', padding: '4px 10px' }}
                onClick={() => handleCopy(getFullCopyText())}
              >
                {copied ? <Check size={12} color="var(--color-primary)" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </div>

      {renderChannelBody()}

      <div className="channel-meta-bar">
        <span>{meta?.description || 'Campaign proof'}</span>
        <span style={{ color: status === 'ready' ? 'var(--color-primary)' : 'var(--color-ink-muted)' }}>
          {status === 'ready' ? 'READY' : status.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
