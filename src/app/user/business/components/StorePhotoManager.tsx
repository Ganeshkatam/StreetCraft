'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { BusinessProfile } from '../../../../lib/server/business/getBusinessProfile';
import { updateBusinessProfile } from '../../../../lib/server/business/updateBusinessProfile';
import { supabase } from '../../../../lib/supabase';

interface StorePhotoManagerProps {
  businessId: string;
  profile: BusinessProfile;
}

export const StorePhotoManager: React.FC<StorePhotoManagerProps> = ({ businessId, profile }) => {
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string | null>(profile.logo_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const storeInitial = (profile.name || 'S').charAt(0).toUpperCase();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict 2MB Limit
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('Store image size exceeds 2MB limit. Please choose a smaller file.');
      return;
    }

    // Supported formats
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Unsupported image format. Please upload PNG, JPEG or WebP.');
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `${businessId}/logo-${Date.now()}.${fileExt}`;

      // Upload into isolated storefronts bucket
      const { error: uploadError } = await supabase.storage
        .from('storefronts')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) {
        setIsUploading(false);
        toast.error(`Upload error: ${uploadError.message}`);
        return;
      }

      // Public URL retrieval
      const { data: urlData } = supabase.storage
        .from('storefronts')
        .getPublicUrl(filePath);

      const newPublicUrl = urlData.publicUrl;

      // Persist to business profile database record
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
      formData.set('logo_url', newPublicUrl);

      const res = await updateBusinessProfile(businessId, { success: false }, formData);
      setIsUploading(false);

      if (res.success) {
        setLogoUrl(newPublicUrl);
        router.refresh();
        toast.success('Store photo updated');
      } else {
        const msg = res.errors?.logo_url?.[0] || res.message || 'Failed to update store photo.';
        toast.error(msg);
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
      router.refresh();
      toast.success('Store photo removed');
    } else {
      const msg = res.message || 'Failed to remove photo.';
      toast.error(msg);
    }
  };

  return (
    <div className="account-field-row">
      <div className="account-avatar-manager-row">
        {/* Left Side: Store Logo with Hover Camera Overlay + Title */}
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
            title="Click to change store photo"
            aria-label="Change store photo"
          >
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
            Store Photo
          </div>
        </div>

        {/* Right Side: Remove photo link & Change photo button */}
        <div className="account-avatar-right-actions">
          {logoUrl && (
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
            {logoUrl ? 'Change photo' : 'Add photo'}
          </button>
        </div>
      </div>

      <div className="account-field-row-divider" />
    </div>
  );
};
