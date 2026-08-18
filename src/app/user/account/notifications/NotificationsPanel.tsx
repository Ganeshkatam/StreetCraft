'use client';

import React, { useState } from 'react';
import { AccountUserProfile } from '../../../../lib/server/account/getAccountProfile';
import { updateAccountProfileAction } from '../../../../lib/server/account/updateAccountProfileAction';
import { AccountSaveIndicator, SaveStatus } from '../components/AccountSaveIndicator';
import { toast } from 'sonner';

interface NotificationsPanelProps {
  profile: AccountUserProfile;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ profile }) => {
  const [prefs, setPrefs] = useState(profile.notificationPreferences);
  const [toggleStatus, setToggleStatus] = useState<Record<string, SaveStatus>>({});

  const handleToggle = async (key: keyof typeof prefs) => {
    const nextVal = !prefs[key];
    const newPrefs = { ...prefs, [key]: nextVal };
    setPrefs(newPrefs);
    setToggleStatus((prev) => ({ ...prev, [key]: 'saving' }));

    const formData = new FormData();
    formData.set('fullName', profile.fullName || '');
    formData.set('phone', profile.phone || '');
    formData.set('avatarUrl', profile.avatarUrl || '');
    formData.set('emailNotifs', newPrefs.email ? 'on' : 'off');
    formData.set('whatsappNotifs', newPrefs.whatsapp ? 'on' : 'off');
    formData.set('weeklyDigest', newPrefs.weeklyDigest ? 'on' : 'off');

    const res = await updateAccountProfileAction(null, formData);
    if (res.success) {
      setToggleStatus((prev) => ({ ...prev, [key]: 'saved' }));
      toast.success('Notification preferences updated.');
      setTimeout(() => {
        setToggleStatus((prev) => ({ ...prev, [key]: 'idle' }));
      }, 2000);
    } else {
      setPrefs(prefs);
      setToggleStatus((prev) => ({ ...prev, [key]: 'error' }));
      toast.error(res.message || 'Failed to update preferences.');
    }
  };

  const notificationChannels: Array<{
    key: keyof typeof prefs;
    label: string;
    description: string;
  }> = [
    {
      key: 'email',
      label: 'Email',
      description: 'Product updates and critical account information',
    },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      description: 'Campaign launches and retail traffic alerts',
    },
    {
      key: 'weeklyDigest',
      label: 'Weekly digest',
      description: 'Weekly store performance and ROI summary',
    },
  ];

  return (
    <div className="account-pane-fields">
      {notificationChannels.map((channel) => {
        const isEnabled = prefs[channel.key];
        const status = toggleStatus[channel.key] || 'idle';
        return (
          <div key={channel.key} className="account-field-row">
            <div className="account-field-meta-label">
              {channel.label.toUpperCase()}
            </div>

            <div className="account-field-content-row">
              <div className="account-notif-info">
                <div className="account-notif-title">{channel.label}</div>
                <div className="account-notif-desc">{channel.description}</div>
              </div>

              <div className="account-notif-action-box">
                {status === 'saving' && <AccountSaveIndicator status="saving" />}
                {status === 'saved' && <AccountSaveIndicator status="saved" />}
                {status === 'error' && <AccountSaveIndicator status="error" />}
                <button
                  type="button"
                  onClick={() => handleToggle(channel.key)}
                  className={`account-switch-toggle ${isEnabled ? 'checked' : ''}`}
                  role="switch"
                  aria-checked={isEnabled}
                  aria-label={`Toggle ${channel.label}`}
                >
                  <span className="account-switch-thumb" />
                </button>
              </div>
            </div>

            <div className="account-field-row-divider" />
          </div>
        );
      })}
    </div>
  );
};
