'use client';

import { useState, useEffect, useCallback } from 'react';
import { Commerce } from '@/types';
import { getCommerces } from '@/lib/commerceService';

export function useCommerces() {
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    getCommerces()
      .then(setCommerces)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return { commerces, loading, error, refresh: load };
}
