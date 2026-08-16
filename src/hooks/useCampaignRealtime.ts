import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../lib/api';
import { FullCampaignPack } from '../types/campaign';
import { UUID } from '../types/common';

export interface ChannelRealtimeProgress {
  channel: string;
  status: 'pending' | 'generating' | 'ready' | 'failed';
}

export function useCampaignRealtime(campaignId: UUID | null) {
  const [pack, setPack] = useState<FullCampaignPack | null>(null);
  const [channelProgress, setChannelProgress] = useState<Record<string, 'pending' | 'generating' | 'ready' | 'failed'>>({
    GOOGLE_BUSINESS: 'pending',
    INSTAGRAM: 'pending',
    WHATSAPP: 'pending',
    IN_STORE_POSTER: 'pending',
  });

  const fetchCampaign = async () => {
    if (!campaignId) return;
    const data = await api.getCampaign(campaignId);
    if (data) {
      setPack(data);
    }
  };

  useEffect(() => {
    if (!campaignId) return;
    fetchCampaign();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel(`realtime:campaign_outputs:${campaignId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'campaign_outputs',
            filter: `campaign_id=eq.${campaignId}`,
          },
          (payload) => {
            const newRow = payload.new as { channel: string; status: 'pending' | 'generating' | 'ready' | 'failed' };
            if (newRow && newRow.channel) {
              setChannelProgress((prev) => ({
                ...prev,
                [newRow.channel]: newRow.status,
              }));
            }
            fetchCampaign();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [campaignId]);

  return {
    pack,
    channelProgress,
    setChannelProgress,
    refreshCampaign: fetchCampaign,
  };
}
