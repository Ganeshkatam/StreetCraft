import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../lib/api';
import { BusinessProfile } from '../types/business';
import { UUID } from '../types/common';

export function useBusiness(businessId: UUID) {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProfile = async () => {
    if (!businessId) {
      setProfile(null);
      setLoading(false);
      setError(false);
      return;
    }
    setError(false);
    try {
      const p = await api.getBusinessProfile(businessId);
      setProfile(p || null);
    } catch (err) {
      console.warn('Failed to fetch business profile for business:', businessId, err);
      setError(true);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    if (isSupabaseConfigured && businessId) {
      // Supabase Realtime subscription for business profile updates
      const channel = supabase
        .channel(`biz_prof_${businessId}_${Math.random().toString(36).slice(2, 9)}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'business_profiles',
            filter: `business_id=eq.${businessId}`,
          },
          () => {
            fetchProfile();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [businessId]);

  const updateProfile = async (updates: Partial<BusinessProfile>) => {
    if (!businessId) return null;
    const updated = await api.updateBusinessProfile(businessId, updates);
    setProfile(updated);
    return updated;
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile: fetchProfile,
  };
}
