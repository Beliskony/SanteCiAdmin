// src/hooks/useHospitals.ts
import { useEffect, useState, useCallback } from 'react';
import api, { ApiError } from '../lib/api';
import type { HospitalListItem, HospitalStatusFilter } from '../types/IHopital';

interface HospitalsResponse {
  hospitals: HospitalListItem[];
  total: number;
  page: number;
  pages: number;
}

export function useHospitals({ status, search, page }: { status: HospitalStatusFilter; search: string; page: number }) {
  const [data, setData] = useState<HospitalsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ status, page: String(page), limit: '15' });
    if (search.trim()) params.set('search', search.trim());

    api.get<{ data: HospitalsResponse }>(`/admin/hospitals?${params.toString()}`)
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Impossible de charger les établissements.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [status, search, page, reloadKey]);

  return { data, isLoading, error, refetch };
}