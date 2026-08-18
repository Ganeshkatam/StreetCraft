'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { AccountUserProfile } from '../../../../lib/server/account/getAccountProfile';
import { updateAccountProfileAction } from '../../../../lib/server/account/updateAccountProfileAction';
import { supabase } from '../../../../lib/supabase';

interface ProfilePhotoManagerProps {
  profile: AccountUserProfile;
}

export const ProfilePhotoManager: React.FC<ProfilePhotoManagerProps> = ({ profile }) => {
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userInitial = (profile.fullName || profile.email || 'U').charAt(0).toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict 2MB Limit
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('Image size exceeds 2MB limit. Please choose a smaller photo.');
      return;
    }

    // Supported Image Formats
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Unsupported image format. Please upload PNG, JPEG or WebP.');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `${profile.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload into isolated avatars storage bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) {
        setIsUploading(false);
        toast.error(`Upload error: ${uploadError.message}`);
        return;
      }

      // Retrieve public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const newPublicUrl = urlData.publicUrl;

      // Persist to user profile database record
      const formData = new FormData();
      formData.set('fullName', profile.fullName || '');
      formData.set('phone', profile.phone || '');
      formData.set('avatarUrl', newPublicUrl);
      formData.set('emailNotifs', profile.notificationPreferences.email ? 'on' : 'off');
      formData.set('whatsappNotifs', profile.notificationPreferences.whatsapp ? 'on' : 'off');
      formData.set('weeklyDigest', profile.notificationPreferences.weeklyDigest ? 'on' : 'off');

      const res = await updateAccountProfileAction(null, formData);
      setIsUploading(false);

      if (res.success) {
        setAvatarUrl(newPublicUrl);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('streetcraft:profile-updated', { detail: { avatarUrl: newPublicUrl } }));
        }
        router.refresh();
        toast.success('Profile photo updated');
      } else {
        toast.error(res.message || 'Failed to update profile photo.');
      }
    } catch (err: unknown) {
      setIsUploading(false);
      const errMsg = err instanceof Error ? err.message : 'Upload failed.';
      toast.error(errMsg);
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);

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
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('streetcraft:profile-updated', { detail: { avatarUrl: '' } }));
      }
      router.refresh();
      toast.success('Profile photo removed');
    } else {
      toast.error(res.message || 'Failed to remove photo.');
    }
  };

  return (
    <div className="account-field-row">
      <div className="account-avatar-manager-row">
        {/* Left Side: Avatar with Hover Camera Overlay + Title */}
        <div className="account-avatar-left-group">
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
            className="account-avatar-interactive-trigger"
            title="Click to change photo"
            aria-label="Change profile photo"
          >
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

            {/* Hover Camera Icon Overlay */}
            <div className="account-avatar-hover-overlay">
              {isUploading ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <Camera size={20} />
              )}
            </div>
          </button>

          <div className="account-avatar-meta-title">
            Profile Photo
          </div>
        </div>

        {/* Right Side: Remove photo link & Change photo button */}
        <div className="account-avatar-right-actions">
          {avatarUrl && (
            <button
              type="button"
              onClick={handleRemovePhoto}
              disabled={isUploading}
              className="account-avatar-text-action"
            >
              Remove photo
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="account-field-edit-action"
          >
            {avatarUrl ? 'Change photo' : 'Add photo'}
          </button>
        </div>
      </div>

      <div className="account-field-row-divider" />
    </div>
  );
};
