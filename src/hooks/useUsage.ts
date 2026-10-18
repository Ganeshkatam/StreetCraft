import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../lib/api';
import { UsageSummary, UsageEvent } from '../types/billing';
import { UUID } from '../types/common';

export function useUsage(businessId: UUID | string | null | undefined) {
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [events, setEvents] = useState<UsageEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(businessId));
  const [error, setError] = useState<string | null>(null);

  // Monotonic request generation counter shared across automatic fetches and manual refreshes
  const activeRequestIdRef = useRef<number>(0);

  const executeFetch = useCallback(async (targetBizId: string | null | undefined) => {
    activeRequestIdRef.current += 1;
    const currentRequestId = activeRequestIdRef.current;

    if (!targetBizId) {
      setUsage(null);
      setEvents([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    try {
      const [u, e] = await Promise.all([
        api.getUsageSummary(targetBizId),
        api.getUsageEvents(targetBizId),
      ]);
      // Discard response if a newer fetch or business switch has occurred
      if (currentRequestId !== activeRequestIdRef.current) return;
      setUsage(u);
      setEvents(e);
      setError(null);
    } catch (err: unknown) {
      if (currentRequestId !== activeRequestIdRef.current) return;
      console.warn('Failed to fetch usage periods and events:', err);
      setUsage(null);
      setEvents([]);
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
    } finally {
      if (currentRequestId === activeRequestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const refreshUsage = useCallback(async () => {
    return executeFetch(businessId);
  }, [businessId, executeFetch]);

  useEffect(() => {
    // Invalidate any in-flight requests from a previous storefront immediately
    activeRequestIdRef.current += 1;

    setUsage(null);
    setEvents([]);
    setError(null);

    if (!businessId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    executeFetch(businessId);

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
            executeFetch(businessId);
          }
        )
        .subscribe();

      return () => {
        activeRequestIdRef.current += 1;
        supabase.removeChannel(channel);
      };
    }

    return () => {
      activeRequestIdRef.current += 1;
    };
  }, [businessId, executeFetch]);

  return {
    usage,
    events,
    loading,
    error,
    refreshUsage,
  };
}
