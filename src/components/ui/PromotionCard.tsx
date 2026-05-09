import { Tag, Calendar, Store } from 'lucide-react';
import { Promotion } from '@/types';

interface Props {
  promotion: Promotion;
}

export default function PromotionCard({ promotion }: Props) {
  const endsAt = new Date(promotion.endsAt);
  const today = new Date();
  const daysLeft = Math.ceil((endsAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const isUrgent = daysLeft <= 3;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden flex flex-col ${
      promotion.isFeatured ? 'border-amber-200' : 'border-slate-100'
    }`}>
      {/* Colored header */}
      <div className={`px-5 pt-5 pb-4 ${promotion.isFeatured ? 'bg-amber-50' : 'bg-slate-50'}`}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
            promotion.isFeatured
              ? 'bg-amber-500 text-white'
              : 'bg-slate-200 text-slate-600'
          }`}>
            <Tag className="w-3 h-3" />
            {promotion.isFeatured ? 'Promoción destacada' : 'Oferta especial'}
          </div>
          {isUrgent && (
            <span className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
              ¡Últimos {daysLeft} días!
            </span>
          )}
        </div>
        <h3 className="font-bold text-slate-900 text-base leading-snug">{promotion.title}</h3>
      </div>

      <div className="px-5 py-4 flex flex-col flex-1">
        <p className="text-sm text-slate-500 leading-relaxed mb-4">{promotion.description}</p>

        {promotion.conditions && (
          <p className="text-xs text-slate-400 italic mb-4 leading-relaxed">
            * {promotion.conditions}
          </p>
        )}

        <div className="mt-auto space-y-2">
          {promotion.commerceName && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Store className="w-3.5 h-3.5" />
              {promotion.commerceName}
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            Válido hasta {new Date(promotion.endsAt).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'long',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
