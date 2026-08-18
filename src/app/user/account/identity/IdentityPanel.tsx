'use client';

import React, { useState } from 'react';
import { Download, Check } from 'lucide-react';
import { EditableAccountField } from './EditableAccountField';
import { AuthIdentityField } from './AuthIdentityField';
import { ProfilePhotoManager } from './ProfilePhotoManager';
import { AccountUserProfile } from '../../../../lib/server/account/getAccountProfile';
import { updateAccountProfileAction } from '../../../../lib/server/account/updateAccountProfileAction';
import { toast } from 'sonner';

interface IdentityPanelProps {
  profile: AccountUserProfile;
}

export const IdentityPanel: React.FC<IdentityPanelProps> = ({ profile }) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleSaveName = async (newName: string): Promise<{ success: boolean; error?: string }> => {
    const formData = new FormData();
    formData.set('fullName', newName);
    formData.set('phone', profile.phone || '');
    formData.set('avatarUrl', profile.avatarUrl || '');
    formData.set('emailNotifs', profile.notificationPreferences.email ? 'on' : 'off');
    formData.set('whatsappNotifs', profile.notificationPreferences.whatsapp ? 'on' : 'off');
    formData.set('weeklyDigest', profile.notificationPreferences.weeklyDigest ? 'on' : 'off');

    const res = await updateAccountProfileAction(null, formData);
    if (!res.success) {
      const firstErr = res.errors?.fullName?.[0] || res.message;
      return { success: false, error: firstErr };
    }
    return { success: true };
  };

  const handleSavePhone = async (newPhone: string): Promise<{ success: boolean; error?: string }> => {
    const formData = new FormData();
    formData.set('fullName', profile.fullName || '');
    formData.set('phone', newPhone);
    formData.set('avatarUrl', profile.avatarUrl || '');
    formData.set('emailNotifs', profile.notificationPreferences.email ? 'on' : 'off');
    formData.set('whatsappNotifs', profile.notificationPreferences.whatsapp ? 'on' : 'off');
    formData.set('weeklyDigest', profile.notificationPreferences.weeklyDigest ? 'on' : 'off');

    const res = await updateAccountProfileAction(null, formData);
    if (!res.success) {
      const firstErr = res.errors?.phone?.[0] || res.message;
      return { success: false, error: firstErr };
    }
    return { success: true };
  };

  const handleExportData = () => {
    const exportPayload = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      accountProfile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
        createdAt: profile.createdAt,
        notificationPreferences: profile.notificationPreferences,
      },
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streetcraft-account-${profile.id.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    toast.success('Account data archive exported.');
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="account-pane-fields">
      <ProfilePhotoManager profile={profile} />

      <EditableAccountField
        label="Full Name"
        value={profile.fullName || ''}
        placeholder="e.g. Ganesh Katam"
        type="text"
        onSave={handleSaveName}
      />

      <AuthIdentityField
        label="Login Email"
        email={profile.email}
      />

      <EditableAccountField
        label="Phone / WhatsApp"
        value={profile.phone || ''}
        placeholder="e.g. 8317527188"
        type="tel"
        onSave={handleSavePhone}
      />

      {/* ACCOUNT DATA EXPORT ROW */}
      <div className="account-field-row">
        <div className="account-field-meta-label">
          ACCOUNT DATA &amp; PRIVACY
        </div>

        <div className="account-field-content-row">
          <div>
            <div className="account-export-title">Account Archive &amp; Export</div>
            <div className="account-export-sub">Download your authenticated account records in JSON format</div>
          </div>

          <button
            type="button"
            onClick={handleExportData}
            className="account-field-edit-action"
          >
            {downloaded ? (
              <>
                <Check size={14} />
                <span>Exported</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Export Data</span>
              </>
            )}
          </button>
        </div>

        <div className="account-field-row-divider" />
      </div>
    </div>
  );
};
