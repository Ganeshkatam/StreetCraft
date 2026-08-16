import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../lib/api';
import { UsageSummary, UsageEvent } from '../types/billing';
import { UUID } from '../types/common';

export function useUsage(businessId: UUID) {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [events, setEvents] = useState<UsageEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsage = async () => {
    if (!businessId) {
      setUsage(null);
      setEvents([]);
      setLoading(false);
      return;
    }
    try {
      const [u, e] = await Promise.all([
        api.getUsageSummary(businessId),
        api.getUsageEvents(businessId),
      ]);
      setUsage(u);
      setEvents(e);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();

    if (isSupabaseConfigured && businessId) {
      const channel = supabase
        .channel(`realtime:usage:${businessId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'usage_periods',
            filter: `business_id=eq.${businessId}`,
          },
          () => {
            fetchUsage();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [businessId]);

  return {
    usage,
    events,
    loading,
    refreshUsage: fetchUsage,
  };
}
