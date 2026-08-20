// src/hooks/useAdmins.ts
import { useEffect, useState, useCallback } from 'react';
import api, { ApiError } from '../lib/api';
import type { AdminAccountListItem } from '../types/IAdminAccount';

export function useAdmins() {
  const [admins, setAdmins] = useState<AdminAccountListItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    api.get<{ data: AdminAccountListItem[] }>('/admin')
      .then((res) => { if (!cancelled) setAdmins(res.data); })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Impossible de charger les administrateurs.');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [reloadKey]);

  return { admins, isLoading, error, refetch };
}