// src/hooks/useSubscriptions.ts
import { useEffect, useState, useCallback } from 'react';
import api, { ApiError } from '../lib/api';
import type { SubscriptionListItem, SubscriptionPlanFilter } from '../types/ISubscription';

interface SubscriptionsResponse {
  doctors: SubscriptionListItem[];
  total: number;
  page: number;
  pages: number;
}

export function useSubscriptions({ plan, page }: { plan: SubscriptionPlanFilter; page: number }) {
  const [data, setData] = useState<SubscriptionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ plan, page: String(page), limit: '15' });

    api.get<{ data: SubscriptionsResponse }>(`/admin/subscriptions?${params.toString()}`)
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Impossible de charger les abonnements.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [plan, page, reloadKey]);

  return { data, isLoading, error, refetch };
}