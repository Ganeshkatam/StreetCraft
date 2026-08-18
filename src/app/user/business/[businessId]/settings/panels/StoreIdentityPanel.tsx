'use client';

import React from 'react';
import { EditableField } from '../../../../components/EditableField';
import { StorePhotoManager } from '../components/StorePhotoManager';
import { BusinessProfile } from '../../../../../../lib/server/business/getBusinessProfile';
import { updateBusinessProfile } from '../../../../../../lib/server/business/updateBusinessProfile';
import { STORE_CATEGORIES } from '../../../../../../config/categories';
import { BRAND_TONE_OPTIONS } from '../../../../../../config/brandTones';

interface StoreIdentityPanelProps {
  profile: BusinessProfile;
}

export const StoreIdentityPanel: React.FC<StoreIdentityPanelProps> = ({ profile }) => {
  const businessId = profile.business_id;

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

      <EditableField
        label="Store Name"
        value={profile.name || ''}
        placeholder="e.g. Resto cafe"
        type="text"
        onSave={async (val) => { await saveField('name', String(val)); }}
      />

      <EditableField
        label="Category &amp; Concept"
        value={profile.category || ''}
        placeholder="Select business category"
        type="select"
        options={STORE_CATEGORIES}
        onSave={async (val) => { await saveField('category', String(val)); }}
      />

      <EditableField
        label="Neighborhood"
        value={profile.neighborhood || ''}
        placeholder="e.g. Indiranagar 100ft Road"
        type="text"
        onSave={async (val) => { await saveField('neighborhood', String(val)); }}
      />

      <EditableField
        label="City"
        value={profile.city || ''}
        placeholder="e.g. Bangalore"
        type="text"
        onSave={async (val) => { await saveField('city', String(val)); }}
      />

      <EditableField
        label="Local Landmarks"
        value={profile.landmarks || ''}
        placeholder="e.g. Opposite Metro Pillar 42"
        type="text"
        onSave={async (val) => { await saveField('landmarks', String(val)); }}
      />

      <EditableField
        label="Brand Voice &amp; Tone"
        value={profile.style_voice || ''}
        placeholder="Select brand voice &amp; tone"
        type="select"
        options={BRAND_TONE_OPTIONS}
        onSave={async (val) => { await saveField('style_voice', String(val)); }}
      />
    </div>
  );
};
