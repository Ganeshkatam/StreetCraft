'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { BusinessProfile } from '../../../../../../lib/server/business/getBusinessProfile';
import { updateBusinessProfile } from '../../../../../../lib/server/business/updateBusinessProfile';
import { supabase } from '../../../../../../lib/supabase';

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

      // Get public URL
      const { data } = supabase.storage
        .from('storefronts')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // Save to business profile
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
      formData.set('logo_url', publicUrl);

      const res = await updateBusinessProfile(businessId, { success: false }, formData);

      if (!res.success) {
        setIsUploading(false);
        toast.error(res.message || 'Failed to update store photo.');
        return;
      }

      setLogoUrl(publicUrl);
      setIsUploading(false);
      toast.success('Store photo updated successfully.');
      router.refresh();
    } catch (err: unknown) {
      setIsUploading(false);
      const msg = err instanceof Error ? err.message : 'Upload failed';
      toast.error(msg);
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    try {
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
      formData.set('logo_url', '');

      const res = await updateBusinessProfile(businessId, { success: false }, formData);

      if (!res.success) {
        setIsUploading(false);
        toast.error(res.message || 'Failed to remove store photo.');
        return;
      }

      setLogoUrl(null);
      setIsUploading(false);
      toast.success('Store photo removed.');
      router.refresh();
    } catch (err: unknown) {
      setIsUploading(false);
      const msg = err instanceof Error ? err.message : 'Remove failed';
      toast.error(msg);
    }
  };

  return (
    <div className="account-field-row" style={{ paddingBottom: '24px' }}>
      <div className="account-field-meta-label">
        STOREFRONT PHOTO / LOGO
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative' }}>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Storefront photo"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-sm)',
                objectFit: 'cover',
                border: '1px solid var(--color-border)',
              }}
            />
          ) : (
            <div
              className="avatar-placeholder"
              style={{
                width: '80px',
                height: '80px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '28px',
              }}
            >
              {storeInitial}
            </div>
          )}

          {isUploading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Loader2 size={24} color="#fff" className="animate-spin" />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <button
              type="button"
              className="btn-secondary"
              style={{ fontSize: '12.5px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera size={14} />
              <span>{logoUrl ? 'Change Photo' : 'Upload Store Photo'}</span>
            </button>

            {logoUrl && (
              <button
                type="button"
                className="btn-ghost"
                style={{ fontSize: '12.5px', color: 'var(--color-danger)' }}
                onClick={handleRemovePhoto}
                disabled={isUploading}
              >
                Remove
              </button>
            )}
          </div>

          <div style={{ fontSize: '12px', color: 'var(--color-ink-muted)' }}>
            Recommended: Square JPG, PNG, or WebP. Max 2MB. Appears in posters and marketing proofs.
          </div>
        </div>
      </div>

      <div className="account-field-row-divider" style={{ marginTop: '20px' }} />
    </div>
  );
};
