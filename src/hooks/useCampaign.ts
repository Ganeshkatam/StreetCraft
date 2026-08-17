import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../lib/api';
import { FullCampaignPack, CampaignStatus } from '../types/campaign';
import { UUID } from '../types/common';

export function useCampaign(businessId: UUID) {
  const [campaigns, setCampaigns] = useState<FullCampaignPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCampaigns = async () => {
    if (!businessId) {
      setCampaigns([]);
      setLoading(false);
      setError(false);
      return;
    }
    setError(false);
    try {
      const list = await api.getCampaigns(businessId);
      setCampaigns(list);
    } catch (err) {
      console.warn('Failed to fetch campaigns for business:', businessId, err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();

    if (isSupabaseConfigured && businessId) {
      const channel = supabase
        .channel(`campaigns_${businessId}_${Math.random().toString(36).slice(2, 9)}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'campaigns',
            filter: `business_id=eq.${businessId}`,
          },
          () => {
            fetchCampaigns();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [businessId]);

  const updateStatus = async (campaignId: UUID, status: CampaignStatus, notes?: string) => {
    await api.updateCampaignStatus(campaignId, status, notes);
    await fetchCampaigns();
  };

  const deleteCampaign = async (campaignId: UUID) => {
    await api.deleteCampaign(campaignId);
    await fetchCampaigns();
  };

  return {
    campaigns,
    loading,
    error,
    refreshCampaigns: fetchCampaigns,
    updateStatus,
    deleteCampaign,
  };
}
