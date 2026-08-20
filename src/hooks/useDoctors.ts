// src/hooks/useDoctors.ts
import { useEffect, useState, useCallback } from 'react';
import api, { ApiError } from '../lib/api';
import type { DoctorListItem, DoctorStatusFilter } from '../types/IDoctor';

interface DoctorsResponse {
  doctors: DoctorListItem[];
  total: number;
  page: number;
  pages: number;
}

interface UseDoctorsParams {
  status: DoctorStatusFilter;
  search: string;
  page: number;
}

export function useDoctors({ status, search, page }: UseDoctorsParams) {
  const [data, setData] = useState<DoctorsResponse | null>(null);
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

    api.get<{ data: DoctorsResponse }>(`/admin/doctors?${params.toString()}`)
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Impossible de charger les médecins.');
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [status, search, page, reloadKey]);

  return { data, isLoading, error, refetch };
}