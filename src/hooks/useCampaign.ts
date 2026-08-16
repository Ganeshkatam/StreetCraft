import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../lib/api';
import { FullCampaignPack, CampaignStatus } from '../types/campaign';
import { UUID } from '../types/common';

export function useCampaign(businessId: UUID) {
  const [campaigns, setCampaigns] = useState<FullCampaignPack[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    if (!businessId) {
      setCampaigns([]);
      setLoading(false);
      return;
    }
    try {
      const list = await api.getCampaigns(businessId);
      setCampaigns(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();

    if (isSupabaseConfigured && businessId) {
      const channel = supabase
        .channel(`realtime:campaigns:${businessId}`)
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
    refreshCampaigns: fetchCampaigns,
    updateStatus,
    deleteCampaign,
  };
}
