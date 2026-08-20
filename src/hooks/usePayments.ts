// src/hooks/usePayments.ts
import { useEffect, useState, useCallback } from 'react';
import api, { ApiError } from '../lib/api';
import type { PaymentListItem, PaymentStatusFilter } from '../types/IPayment';

interface PaymentsResponse {
  payments: PaymentListItem[];
  total: number;
  page: number;
  pages: number;
}

export function usePayments({ status, page }: { status: PaymentStatusFilter; page: number }) {
  const [data, setData] = useState<PaymentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ page: String(page), limit: '15' });
    if (status !== 'all') params.set('status', status);

    api.get<{ data: PaymentsResponse }>(`/admin/payments?${params.toString()}`)
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Impossible de charger les paiements.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [status, page, reloadKey]);

  return { data, isLoading, error, refetch };
}