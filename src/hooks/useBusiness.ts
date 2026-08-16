import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../lib/api';
import { BusinessProfile } from '../types/business';
import { UUID } from '../types/common';

export function useBusiness(businessId: UUID) {
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!businessId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const p = await api.getBusinessProfile(businessId);
      setProfile(p);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    if (isSupabaseConfigured && businessId) {
      // Supabase Realtime subscription for business profile updates
      const channel = supabase
        .channel(`realtime:business_profiles:${businessId}`)
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
    updateProfile,
    refreshProfile: fetchProfile,
  };
}
