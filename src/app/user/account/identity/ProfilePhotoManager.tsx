'use client';

import React, { useState, useRef } from 'react';
import { Trash2, Upload, Loader2, Check } from 'lucide-react';
import { AccountUserProfile } from '../../../../lib/server/account/getAccountProfile';
import { updateAccountProfileAction } from '../../../../lib/server/account/updateAccountProfileAction';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'sonner';

interface ProfilePhotoManagerProps {
  profile: AccountUserProfile;
}

export const ProfilePhotoManager: React.FC<ProfilePhotoManagerProps> = ({ profile }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userInitial = (profile.fullName || profile.email || 'U').charAt(0).toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please select a valid image file (PNG, JPEG, WebP).' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Image size cannot exceed 2MB.' });
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      // 1. Try uploading to Supabase Storage 'avatars' bucket
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      let finalAvatarUrl: string;

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(uploadData.path);
        finalAvatarUrl = publicUrlData.publicUrl;
      } else {
        // Fallback: client-side compressed base64 data URI
        finalAvatarUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const maxDim = 400;
              let width = img.width;
              let height = img.height;
              if (width > height) {
                if (width > maxDim) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                }
              } else {
                if (height > maxDim) {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
              } else {
                resolve(ev.target?.result as string);
              }
            };
            img.onerror = reject;
            img.src = ev.target?.result as string;
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      // 2. Persist URL in Supabase profiles table via Server Action
      const formData = new FormData();
      formData.set('fullName', profile.fullName || '');
      formData.set('phone', profile.phone || '');
      formData.set('avatarUrl', finalAvatarUrl);
      formData.set('emailNotifs', profile.notificationPreferences.email ? 'on' : 'off');
      formData.set('whatsappNotifs', profile.notificationPreferences.whatsapp ? 'on' : 'off');
      formData.set('weeklyDigest', profile.notificationPreferences.weeklyDigest ? 'on' : 'off');

      const res = await updateAccountProfileAction(null, formData);
      setIsUploading(false);

      if (res.success) {
        setAvatarUrl(finalAvatarUrl);
        setFeedback({ type: 'success', message: 'Profile photo updated successfully.' });
        toast.success('Profile photo updated successfully.');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        const msg = res.message || 'Failed to save photo.';
        setFeedback({ type: 'error', message: msg });
        toast.error(msg);
      }
    } catch (err) {
      console.error('Profile photo upload error:', err);
      setIsUploading(false);
      setFeedback({ type: 'error', message: 'An error occurred while uploading.' });
      toast.error('An error occurred while uploading.');
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.set('fullName', profile.fullName || '');
    formData.set('phone', profile.phone || '');
    formData.set('avatarUrl', ''); // clear avatar
    formData.set('emailNotifs', profile.notificationPreferences.email ? 'on' : 'off');
    formData.set('whatsappNotifs', profile.notificationPreferences.whatsapp ? 'on' : 'off');
    formData.set('weeklyDigest', profile.notificationPreferences.weeklyDigest ? 'on' : 'off');

    const res = await updateAccountProfileAction(null, formData);
    setIsUploading(false);

    if (res.success) {
      setAvatarUrl(null);
      setFeedback({ type: 'success', message: 'Profile photo removed.' });
      toast.success('Profile photo removed.');
      setTimeout(() => setFeedback(null), 3000);
    } else {
      const msg = res.message || 'Failed to remove photo.';
      setFeedback({ type: 'error', message: msg });
      toast.error(msg);
    }
  };

  return (
    <div className="account-field-row">
      <div className="account-field-meta-label">
        PROFILE PHOTO
      </div>

      <div className="account-avatar-manager-row">
        {/* Avatar Preview */}
        <div className="account-avatar-preview-box">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={profile.fullName || 'Profile photo'}
              className="account-avatar-preview-img"
            />
          ) : (
            <div className="account-avatar-preview-fallback">
              {userInitial}
            </div>
          )}

          {isUploading && (
            <div className="account-avatar-loading-overlay">
              <Loader2 size={16} className="spin" />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="account-avatar-actions-stack">
          <div className="account-avatar-btn-group">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="account-avatar-hidden-input"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="account-field-edit-action"
            >
              <Upload size={14} />
              <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
            </button>

            {avatarUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={isUploading}
                className="account-avatar-remove-btn"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            )}
          </div>

          <div className="account-avatar-help-text">
            Recommended: Square image &bull; PNG, JPEG or WebP (max 2MB)
          </div>

          {feedback && (
            <div className={`account-avatar-feedback ${feedback.type}`}>
              {feedback.type === 'success' && <Check size={12} />}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>
      </div>

      <div className="account-field-row-divider" />
    </div>
  );
};
