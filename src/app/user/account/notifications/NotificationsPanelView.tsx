'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationsViewModel } from '../../../../lib/domain/account/accountTypes';
import { updateAccountPreferencesAction, UpdatePreferencesActionState } from '../../../../lib/server/account/updateAccountPreferencesAction';
import { AccountProfileHeader } from '../components/AccountProfileHeader';
import { toast } from 'sonner';
import { Mail, MessageSquare, Sparkles, Check } from 'lucide-react';

interface NotificationsPanelViewProps {
  preferences: NotificationsViewModel;
}

const initialState: UpdatePreferencesActionState = { success: false };

export function NotificationsPanelView({ preferences }: NotificationsPanelViewProps) {
  const router = useRouter();
  const [state, formAction, isSaving] = useActionState(updateAccountPreferencesAction, initialState);

  const [emailAlerts, setEmailAlerts] = useState(preferences.email);
  const [whatsappAlerts, setWhatsappAlerts] = useState(preferences.whatsapp);
  const [weeklyDigest, setWeeklyDigest] = useState(preferences.weeklyDigest);

  useEffect(() => {
    if (state) {
      if (state.success) {
        toast.success(state.message || 'Preferences saved.');
        router.refresh();
      } else if (state.message) {
        toast.error(state.message);
      }
    }
  }, [state, router]);

  return (
    <div>
      <AccountProfileHeader
        eyebrow="PREFERENCES"
        title="Notification Preferences"
        subtitle="Control how and when StreetCraft alerts you about local opportunity triggers and campaign launches."
      />

      <div className="account-stage-content">
        <form action={formAction}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '20px 0 28px' }}>

            {/* Email Notifications */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '16px 20px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', marginTop: '2px' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 4px' }}>
                    Email Campaign Alerts
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', margin: 0, lineHeight: '1.4' }}>
                    Receive notification emails when an AI marketing campaign finishes generation or requires approval.
                  </p>
                </div>
              </div>

              <input type="hidden" name="email" value={emailAlerts ? 'true' : 'false'} />
              <button
                type="button"
                onClick={() => setEmailAlerts(!emailAlerts)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: emailAlerts ? 'var(--color-primary)' : 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  position: 'relative',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'var(--motion-fast)',
                }}
                aria-label="Toggle Email Alerts"
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: emailAlerts ? '22px' : '2px',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>

            {/* Weekly Digest */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '16px 20px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', marginTop: '2px' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 4px' }}>
                    Weekly Store Performance Digest
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', margin: 0, lineHeight: '1.4' }}>
                    A Sunday evening summary of weekly footfall trends, campaign metrics, and upcoming neighborhood events.
                  </p>
                </div>
              </div>

              <input type="hidden" name="weekly_digest" value={weeklyDigest ? 'true' : 'false'} />
              <button
                type="button"
                onClick={() => setWeeklyDigest(!weeklyDigest)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: weeklyDigest ? 'var(--color-primary)' : 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  position: 'relative',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'var(--motion-fast)',
                }}
                aria-label="Toggle Weekly Digest"
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: weeklyDigest ? '22px' : '2px',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>

            {/* WhatsApp Opportunity Triggers */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '16px 20px',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', marginTop: '2px' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)', margin: '0 0 4px' }}>
                    WhatsApp Opportunity Alerts
                  </h4>
                  <p style={{ fontSize: '12.5px', color: 'var(--color-ink-muted)', margin: 0, lineHeight: '1.4' }}>
                    Instant flash alerts sent to your phone when sudden weather changes or neighborhood surges create opportunities.
                  </p>
                </div>
              </div>

              <input type="hidden" name="whatsapp" value={whatsappAlerts ? 'true' : 'false'} />
              <button
                type="button"
                onClick={() => setWhatsappAlerts(!whatsappAlerts)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: whatsappAlerts ? 'var(--color-primary)' : 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                  position: 'relative',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'var(--motion-fast)',
                }}
                aria-label="Toggle WhatsApp Alerts"
              >
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: whatsappAlerts ? '22px' : '2px',
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ fontSize: '13px', padding: '7px 20px' }}
              disabled={isSaving}
            >
              <Check size={14} />
              <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
