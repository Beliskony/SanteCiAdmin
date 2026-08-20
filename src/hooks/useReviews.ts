// src/hooks/useReviews.ts
import { useEffect, useState, useCallback } from 'react';
import api, { ApiError } from '../lib/api';
import type { ReviewListItem, ReviewStatusFilter } from '../types/IReview';

interface ReviewsResponse {
  reviews: ReviewListItem[];
  total: number;
  page: number;
  pages: number;
}

export function useReviews({ status, page }: { status: ReviewStatusFilter; page: number }) {
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ status, page: String(page), limit: '15' });

    api.get<{ data: ReviewsResponse }>(`/admin/reviews?${params.toString()}`)
      .then((res) => { if (!cancelled) setData(res.data); })
      .catch((err) => { if (!cancelled) setError(err instanceof ApiError ? err.message : 'Impossible de charger les avis.'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [status, page, reloadKey]);

  return { data, isLoading, error, refetch };
}