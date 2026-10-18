import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../lib/api';
import { UsageSummary, UsageEvent } from '../types/billing';
import { UUID } from '../types/common';

export function useUsage(businessId: UUID | string | null | undefined) {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [events, setEvents] = useState<UsageEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(businessId));
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    if (!businessId) {
      setUsage(null);
      setEvents([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const [u, e] = await Promise.all([
        api.getUsageSummary(businessId),
        api.getUsageEvents(businessId),
      ]);
      setUsage(u);
      setEvents(e);
      setError(null);
    } catch (err: unknown) {
      console.warn('Failed to fetch usage periods and events:', err);
      setUsage(null);
      setEvents([]);
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (!businessId) {
      setUsage(null);
      setEvents([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Cancellation token: guarantees earlier delayed requests cannot overwrite newer ones
    let isCurrent = true;

    // Immediately clear stale usage data from the previous business
    setUsage(null);
    setEvents([]);
    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        const [u, e] = await Promise.all([
          api.getUsageSummary(businessId),
          api.getUsageEvents(businessId),
        ]);
        if (!isCurrent) return;
        setUsage(u);
        setEvents(e);
        setError(null);
      } catch (err: unknown) {
        if (!isCurrent) return;
        console.warn('Failed to fetch usage periods and events:', err);
        setUsage(null);
        setEvents([]);
        setError(err instanceof Error ? err.message : 'Failed to load usage data');
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    loadData();

    if (isSupabaseConfigured && businessId) {
      const channel = supabase
        .channel(`usage_${businessId}_${Math.random().toString(36).slice(2, 9)}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'usage_periods',
            filter: `business_id=eq.${businessId}`,
          },
          () => {
            if (isCurrent) {
              loadData();
            }
          }
        )
        .subscribe();

      return () => {
        isCurrent = false;
        supabase.removeChannel(channel);
      };
    }

    return () => {
      isCurrent = false;
    };
  }, [businessId]);

  return {
    usage,
    events,
    loading,
    error,
    refreshUsage: fetchUsage,
  };
}
