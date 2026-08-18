'use client';

import React, { useState, useRef } from 'react';
import { Camera, Trash2, Upload, Loader2, Check } from 'lucide-react';
import { BusinessProfile } from '../../../../lib/server/business/getBusinessProfile';
import { updateBusinessProfile } from '../../../../lib/server/business/updateBusinessProfile';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'sonner';

interface StorePhotoManagerProps {
  businessId: string;
  profile: BusinessProfile;
}

export const StorePhotoManager: React.FC<StorePhotoManagerProps> = ({ businessId, profile }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(profile.logo_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storeInitial = (profile.name || 'S').charAt(0).toUpperCase();

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
      // 1. Upload to dedicated Supabase Storage 'storefronts' bucket
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `${businessId}/logo-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('storefronts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      let finalLogoUrl: string;

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('storefronts')
          .getPublicUrl(uploadData.path);
        finalLogoUrl = publicUrlData.publicUrl;
      } else {
        // Fallback: client-side compressed base64 data URI
        finalLogoUrl = await new Promise<string>((resolve, reject) => {
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

      // 2. Persist URL in business_profiles via Server Action
      const formData = new FormData();
      formData.set('name', profile.name || '');
      formData.set('category', profile.category || '');
      formData.set('neighborhood', profile.neighborhood || '');
      formData.set('city', profile.city || '');
      formData.set('landmarks', profile.landmarks || '');
      formData.set('target_customer', profile.target_customer || '');
      formData.set('style_voice', profile.style_voice || '');
      formData.set('signature_items', profile.signature_items || '');
      formData.set('primary_goal', profile.primary_goal || '');
      formData.set('peak_hours', profile.peak_hours || '');
      formData.set('slow_hours', profile.slow_hours || '');
      formData.set('default_offer', profile.default_offer || '');
      formData.set('avg_ticket_inr', profile.avg_ticket_inr ? String(profile.avg_ticket_inr) : '');
      formData.set('target_monthly_customers', profile.target_monthly_customers ? String(profile.target_monthly_customers) : '');
      formData.set('phone_whatsapp', profile.phone_whatsapp || '');
      formData.set('logo_url', finalLogoUrl);

      const res = await updateBusinessProfile(businessId, { success: false }, formData);
      setIsUploading(false);

      if (res.success) {
        setLogoUrl(finalLogoUrl);
        setFeedback({ type: 'success', message: 'Store photo updated.' });
        toast.success('Store photo updated successfully.');
        setTimeout(() => setFeedback(null), 3000);
      } else {
        const msg = res.message || 'Failed to save photo.';
        setFeedback({ type: 'error', message: msg });
        toast.error(msg);
      }
    } catch (err) {
      console.error('Store photo upload error:', err);
      setIsUploading(false);
      setFeedback({ type: 'error', message: 'An error occurred while uploading.' });
      toast.error('An error occurred while uploading.');
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    setFeedback(null);

    const formData = new FormData();
    formData.set('name', profile.name || '');
    formData.set('category', profile.category || '');
    formData.set('neighborhood', profile.neighborhood || '');
    formData.set('city', profile.city || '');
    formData.set('landmarks', profile.landmarks || '');
    formData.set('target_customer', profile.target_customer || '');
    formData.set('style_voice', profile.style_voice || '');
    formData.set('signature_items', profile.signature_items || '');
    formData.set('primary_goal', profile.primary_goal || '');
    formData.set('peak_hours', profile.peak_hours || '');
    formData.set('slow_hours', profile.slow_hours || '');
    formData.set('default_offer', profile.default_offer || '');
    formData.set('avg_ticket_inr', profile.avg_ticket_inr ? String(profile.avg_ticket_inr) : '');
    formData.set('target_monthly_customers', profile.target_monthly_customers ? String(profile.target_monthly_customers) : '');
    formData.set('phone_whatsapp', profile.phone_whatsapp || '');
    formData.set('logo_url', ''); // clear logo

    const res = await updateBusinessProfile(businessId, { success: false }, formData);
    setIsUploading(false);

    if (res.success) {
      setLogoUrl(null);
      setFeedback({ type: 'success', message: 'Store photo removed.' });
      toast.success('Store photo removed.');
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
        STOREFRONT PHOTO &amp; LOGO
      </div>

      <div className="account-avatar-manager-row">
        {/* Store Logo Preview */}
        <div className="account-avatar-preview-box">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={profile.name || 'Storefront'}
              className="account-avatar-preview-img"
            />
          ) : (
            <div className="account-avatar-preview-fallback">
              {storeInitial}
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
              <span>{logoUrl ? 'Change Photo' : 'Upload Store Photo'}</span>
            </button>

            {logoUrl && (
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
