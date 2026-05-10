'use client';

import { useState, useEffect } from 'react';
import { Commerce } from '@/types';
import { getCommerceById } from '@/lib/commerceService';
import { useAuth } from '@/context/AuthContext';

export function useCommerce() {
  const { usuario } = useAuth();
  const [commerce, setCommerce] = useState<Commerce | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario?.commerceId) {
      setLoading(false);
      return;
    }
    getCommerceById(usuario.commerceId)
      .then(setCommerce)
      .catch(() => setCommerce(null))
      .finally(() => setLoading(false));
  }, [usuario?.commerceId]);

  return { commerce, loading };
}
