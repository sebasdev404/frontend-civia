'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { API } from '@/lib/api/client';
import type { AnalyticsOverview } from '@/lib/analytics';

export function useAnalyticsOverview() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const request = useRef<AbortController | null>(null);
  const load = useCallback((controller: AbortController) =>
    API.analytics.getOverview({ signal: controller.signal })
      .then(value => { if (!controller.signal.aborted) setData(value); })
      .catch(failure => {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'No se pudieron consultar las cifras guardadas.');
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); }), []);
  const refresh = useCallback(() => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true); setError(''); setData(null);
    return load(controller);
  }, [load]);
  useEffect(() => {
    const controller = new AbortController();
    request.current = controller;
    void load(controller);
    return () => controller.abort();
  }, [load]);
  return { data, loading, error, refresh };
}
