'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IdentityViewModel } from '../../../../lib/domain/account/accountTypes';
import { updateAccountProfileAction, UpdateProfileActionState } from '../../../../lib/server/account/updateAccountProfileAction';
import { uploadAccountAvatarAction, UploadAvatarActionState } from '../../../../lib/server/account/uploadAccountAvatarAction';
import { AccountProfileHeader } from '../components/AccountProfileHeader';
import { AccountSecurityFooter } from '../components/AccountSecurityFooter';
import { toast } from 'sonner';
import { Camera, Check, ShieldCheck, Mail, Phone, User as UserIcon } from 'lucide-react';

interface IdentityPanelViewProps {
  profile: IdentityViewModel;
}

const initialProfileState: UpdateProfileActionState = { success: false };
const initialAvatarState: UploadAvatarActionState = { success: false };

export function IdentityPanelView({ profile }: IdentityPanelViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileState, profileAction, isSavingProfile] = useActionState(updateAccountProfileAction, initialProfileState);
  const [avatarState, avatarAction, isUploadingAvatar] = useActionState(uploadAccountAvatarAction, initialAvatarState);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName);
  const [phone, setPhone] = useState(profile.phone || '');

  useEffect(() => {
    if (profileState) {
      if (profileState.success) {
        toast.success(profileState.message || 'Profile saved.');
        setIsEditing(false);
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

  const userInitial = (fullName || profile.email || 'U').charAt(0).toUpperCase();
  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });

  return (
    <div>
      <AccountProfileHeader
        eyebrow="YOUR PROFILE"
        title={fullName || 'Your Profile'}
        subtitle={`${profile.email} • Joined ${joinedDate}`}
      />

      <div className="account-stage-content">
        {/* Profile Photo Manager */}
        <div className="account-field-row" style={{ paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <div className="account-field-label">
            PROFILE PHOTO
          </div>

          <div className="account-field-content-row" style={{ alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  overflow: 'hidden',
                  border: '2px solid var(--color-border)',
                  position: 'relative',
                }}
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={fullName || 'User'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  userInitial
                )}
              </div>

              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', marginBottom: '4px' }}>
                  Avatar Image
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>
                  PNG, JPG, or WebP up to 5MB.
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
                style={{ fontSize: '12.5px', padding: '6px 14px' }}
                disabled={isUploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={14} />
                <span>{isUploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Identity Form (Full Name & Phone) */}
        {isEditing ? (
          <form action={profileAction} style={{ marginTop: '24px' }}>
            <div className="workspace-grid-2col" style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name <span style={{ color: 'var(--color-danger)' }}>*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="input-field"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                {profileState.errors?.fullName && (
                  <span className="field-error">{profileState.errors.fullName[0]}</span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number <span style={{ fontSize: '11px', color: 'var(--color-ink-muted)' }}>(Optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input-field"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {profileState.errors?.phone && (
                  <span className="field-error">{profileState.errors.phone[0]}</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '7px 16px' }}
                disabled={isSavingProfile}
                onClick={() => {
                  setFullName(profile.fullName);
                  setPhone(profile.phone || '');
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-primary"
                style={{ fontSize: '13px', padding: '7px 18px' }}
                disabled={isSavingProfile}
              >
                <Check size={14} />
                <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div style={{ marginTop: '24px' }}>
            <div className="account-field-row">
              <div className="account-field-label">FULL NAME</div>
              <div className="account-field-content-row">
                <div style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-ink)' }}>
                  {profile.fullName || <em style={{ color: 'var(--color-ink-muted)' }}>Not set</em>}
                </div>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Name
                </button>
              </div>
            </div>

            <div className="account-field-row" style={{ marginTop: '16px' }}>
              <div className="account-field-label">PHONE NUMBER</div>
              <div className="account-field-content-row">
                <div style={{ fontSize: '14px', color: 'var(--color-ink-soft)', fontFamily: 'var(--font-mono)' }}>
                  {profile.phone || <em style={{ color: 'var(--color-ink-muted)' }}>Not set</em>}
                </div>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Phone
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Read-Only Verified Auth Email */}
        <div className="account-field-row" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
          <div className="account-field-label">AUTHENTICATION EMAIL</div>
          <div className="account-field-content-row">
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} color="var(--color-primary)" />
                <span>{profile.email}</span>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', fontWeight: 700 }}>
                  VERIFIED
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--color-ink-muted)', marginTop: '2px', display: 'block' }}>
                Managed directly via Supabase Auth credentials.
              </span>
            </div>
          </div>
        </div>

        <AccountSecurityFooter />
      </div>
    </div>
  );
}
