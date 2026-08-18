'use client';

import React, { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { IdentityViewModel } from '../../../../lib/domain/account/accountTypes';
import { updateAccountProfileAction, UpdateProfileActionState } from '../../../../lib/server/account/updateAccountProfileAction';
import { uploadAccountAvatarAction, UploadAvatarActionState } from '../../../../lib/server/account/uploadAccountAvatarAction';
import { EditableField } from '../../components/EditableField';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';

interface IdentityPanelViewProps {
  profile: IdentityViewModel;
}

const initialProfileState: UpdateProfileActionState = { success: false };
const initialAvatarState: UploadAvatarActionState = { success: false };

export function IdentityPanelView({ profile }: IdentityPanelViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileState, _profileAction] = useActionState(updateAccountProfileAction, initialProfileState);
  const [avatarState, avatarAction, isUploadingAvatar] = useActionState(uploadAccountAvatarAction, initialAvatarState);

  useEffect(() => {
    if (profileState) {
      if (profileState.success) {
        toast.success(profileState.message || 'Profile saved.');
        router.refresh();
      } else if (profileState.message) {
        toast.error(profileState.message);
      }
    }
  }, [profileState, router]);

  useEffect(() => {
    if (avatarState) {
      if (avatarState.success) {
        toast.success('Profile photo updated.');
        router.refresh();
      } else if (avatarState.message) {
        toast.error(avatarState.message);
      }
    }
  }, [avatarState, router]);

  const userInitial = (profile.fullName || profile.email || 'U').charAt(0).toUpperCase();
  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });

  const handleSaveField = async (field: 'fullName' | 'phone', value: string): Promise<{ success: boolean; error?: string }> => {
    const formData = new FormData();
    formData.set('fullName', field === 'fullName' ? value : profile.fullName);
    formData.set('phone', field === 'phone' ? value : (profile.phone || ''));

    const res = await updateAccountProfileAction({ success: false }, formData);
    if (!res.success) {
      const err = res.errors?.[field]?.[0] || res.message || 'Failed to update profile.';
      return { success: false, error: err };
    }
    toast.success('Profile updated.');
    router.refresh();
    return { success: true };
  };

  return (
    <div className="account-pane">
      <div className="account-pane-header">
        <span className="account-pane-tag">ACCOUNT PROFILE</span>
        <h1 className="account-pane-title">Identity &amp; Contact</h1>
        <p className="account-pane-subtitle">
          Manage your personal profile details, contact information, and authentication credentials.
        </p>
      </div>

      <div className="account-pane-fields">
        {/* Profile Photo Manager */}
        <div className="account-field-row" style={{ alignItems: 'center' }}>
          <div className="account-field-info">
            <div className="account-field-label">PROFILE PHOTO</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '4px' }}>
              <div
                style={{
                  position: 'relative',
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  overflow: 'hidden',
                  border: '1.5px solid var(--color-border)',
                  flexShrink: 0,
                }}
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName || 'User'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  userInitial
                )}

                {isUploadingAvatar && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Loader2 size={16} color="#fff" className="animate-spin" />
                  </div>
                )}
              </div>

              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--color-ink)' }}>
                  Avatar Image
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-ink-muted)' }}>
                  PNG, JPG, or WebP up to 5MB.
                </div>
              </div>
            </div>
          </div>

          <form action={avatarAction}>
            <input
              ref={fileInputRef}
              type="file"
              name="avatar"
              accept="image/png,image/jpeg,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  e.target.form?.requestSubmit();
                }
              }}
            />
            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '5px 12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={13} />
              <span>{isUploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
            </button>
          </form>
        </div>

        {/* Individually Editable Fields */}
        <EditableField
          label="Full Name"
          value={profile.fullName || ''}
          placeholder="Your full name"
          type="text"
          onSave={async (val) => { await handleSaveField('fullName', String(val)); }}
        />

        <EditableField
          label="Phone Number"
          value={profile.phone || ''}
          placeholder="+91 98765 43210"
          type="tel"
          onSave={async (val) => { await handleSaveField('phone', String(val)); }}
        />

        <EditableField
          label="Authentication Email"
          value={profile.email}
          helperText="Managed directly via Supabase Auth credentials."
          isLocked={true}
        />

        <EditableField
          label="Account Status"
          value={`Active Member • Joined ${joinedDate}`}
          helperText="Verified account credentials."
          isLocked={true}
        />
      </div>
    </div>
  );
}
