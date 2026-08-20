// src/hooks/useDashboardStats.ts
import { useEffect, useState } from 'react';
import api, { ApiError } from '../lib/api';

export interface DashboardStats {
  doctors: { total: number; verified: number; pending: number };
  patients: { total: number };
  hospitals: { total: number; pendingVerification: number };
  appointments: { active: number; completed: number };
  revenue: { total: number };
  subscriptions: Array<{ _id: string; count: number }>;
}

interface UseDashboardStatsResult {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboardStats(): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    api.get<{ data: DashboardStats }>('/admin/stats')
      .then((res) => { if (!cancelled) setStats(res.data); })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Impossible de charger les statistiques.');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [reloadKey]);

  function refetch() {
    setReloadKey((k) => k + 1);
  }

  return { stats, isLoading, error, refetch };
}