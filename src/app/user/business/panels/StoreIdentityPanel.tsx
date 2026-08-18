'use client';

import React from 'react';
import { EditableAccountField } from '../../account/identity/EditableAccountField';
import { StorePhotoManager } from '../components/StorePhotoManager';
import { BusinessProfile } from '../../../../lib/server/business/getBusinessProfile';
import { updateBusinessProfile } from '../../../../lib/server/business/updateBusinessProfile';

import { STORE_CATEGORIES } from '../../../../config/categories';
import { BRAND_TONE_OPTIONS } from '../../../../config/brandTones';

interface StoreIdentityPanelProps {
  businessId: string;
  profile: BusinessProfile;
}

export const StoreIdentityPanel: React.FC<StoreIdentityPanelProps> = ({ businessId, profile }) => {
  const saveField = async (field: keyof BusinessProfile, value: string): Promise<{ success: boolean; error?: string }> => {
    const formData = new FormData();
    formData.set('name', field === 'name' ? value : profile.name || '');
    formData.set('category', field === 'category' ? value : profile.category || '');
    formData.set('neighborhood', field === 'neighborhood' ? value : profile.neighborhood || '');
    formData.set('city', field === 'city' ? value : profile.city || '');
    formData.set('landmarks', field === 'landmarks' ? value : profile.landmarks || '');
    formData.set('target_customer', field === 'target_customer' ? value : profile.target_customer || '');
    formData.set('style_voice', field === 'style_voice' ? value : profile.style_voice || '');
    formData.set('signature_items', field === 'signature_items' ? value : profile.signature_items || '');
    formData.set('primary_goal', field === 'primary_goal' ? value : profile.primary_goal || '');
    formData.set('peak_hours', field === 'peak_hours' ? value : profile.peak_hours || '');
    formData.set('slow_hours', field === 'slow_hours' ? value : profile.slow_hours || '');
    formData.set('default_offer', field === 'default_offer' ? value : profile.default_offer || '');
    formData.set('avg_ticket_inr', profile.avg_ticket_inr ? String(profile.avg_ticket_inr) : '');
    formData.set('target_monthly_customers', profile.target_monthly_customers ? String(profile.target_monthly_customers) : '');
    formData.set('phone_whatsapp', profile.phone_whatsapp || '');
    formData.set('logo_url', profile.logo_url || '');

    const res = await updateBusinessProfile(businessId, { success: false }, formData);
    if (!res.success) {
      const err = res.errors?.[field as string]?.[0] || res.message || 'Failed to update store identity.';
      return { success: false, error: err };
    }
    return { success: true };
  };

  return (
    <div className="account-pane-fields">
      <StorePhotoManager
        businessId={businessId}
        profile={profile}
      />

      <EditableAccountField
        label="Store Name"
        value={profile.name || ''}
        placeholder="e.g. Resto cafe"
        type="text"
        onSave={(val) => saveField('name', val)}
      />

      <EditableAccountField
        label="Category & Concept"
        value={profile.category || ''}
        placeholder="Select business category"
        options={STORE_CATEGORIES}
        onSave={(val) => saveField('category', val)}
      />

      <EditableAccountField
        label="Neighborhood"
        value={profile.neighborhood || ''}
        placeholder="e.g. Indiranagar 100ft Road"
        type="text"
        onSave={(val) => saveField('neighborhood', val)}
      />

      <EditableAccountField
        label="City"
        value={profile.city || ''}
        placeholder="e.g. Bangalore"
        type="text"
        onSave={(val) => saveField('city', val)}
      />

      <EditableAccountField
        label="Local Landmarks"
        value={profile.landmarks || ''}
        placeholder="e.g. Opposite Metro Pillar 42"
        type="text"
        onSave={(val) => saveField('landmarks', val)}
      />

      <EditableAccountField
        label="Brand Voice & Tone"
        value={profile.style_voice || ''}
        placeholder="Select brand voice & tone"
        options={BRAND_TONE_OPTIONS}
        onSave={(val) => saveField('style_voice', val)}
      />
    </div>
  );
};
