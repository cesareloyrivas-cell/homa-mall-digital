'use client';

import { useEffect, useState } from 'react';
import { Tag } from 'lucide-react';
import { getApprovedPromotions } from '@/lib/promotionService';
import { Promotion } from '@/types';
import PromotionCard from '@/components/ui/PromotionCard';

export default function PromocionesPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApprovedPromotions()
      .then(setPromos)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-6 h-6 text-amber-400" />
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Ofertas vigentes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Promociones de <span className="text-amber-400">Mall Digital</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl">
            Las mejores ofertas y descuentos de nuestros locales, actualizadas cada semana.
          </p>
        </div>
      </section>

      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : promos.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No hay promociones activas en este momento.</p>
            <p className="text-slate-400 text-sm mt-1">Volvé pronto para ver las próximas ofertas.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">{promos.length} promociones activas</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {promos.map(promo => (
                <PromotionCard key={promo.id} promotion={promo} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
