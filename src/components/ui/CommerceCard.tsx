import Link from 'next/link';
import { MapPin, Clock, MessageCircle, Star, ShieldCheck, BadgeCheck, Flame } from 'lucide-react';
import { Commerce, PublicStatus } from '@/types';

const STATUS_CONFIG: Record<PublicStatus, { label: string; color: string; icon: typeof Star } | null> = {
  destacado: { label: 'Destacado', color: 'bg-amber-500 text-white', icon: Flame },
  verificado: { label: 'Verificado', color: 'bg-emerald-500 text-white', icon: BadgeCheck },
  protegido: { label: 'Protegido', color: 'bg-blue-500 text-white', icon: ShieldCheck },
  publicado: { label: 'Publicado', color: 'bg-slate-200 text-slate-700', icon: Star },
  no_publicado: null,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Gastronomía': 'bg-orange-100 text-orange-700',
  'Indumentaria': 'bg-purple-100 text-purple-700',
  'Tecnología': 'bg-blue-100 text-blue-700',
  'Farmacia': 'bg-green-100 text-green-700',
  'Deportes': 'bg-red-100 text-red-700',
  'Hogar y Deco': 'bg-yellow-100 text-yellow-700',
  'Servicios': 'bg-slate-100 text-slate-700',
};

interface Props {
  commerce: Commerce;
}

export default function CommerceCard({ commerce }: Props) {
  const statusConf = STATUS_CONFIG[commerce.publicStatus];
  const categoryColor = CATEGORY_COLORS[commerce.category] ?? 'bg-slate-100 text-slate-700';

  const initials = commerce.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Link
      href={`/locales/${commerce.slug}`}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all overflow-hidden flex flex-col"
    >
      {/* Imagen / Logo placeholder */}
      <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
        {commerce.logoUrl ? (
          <img src={commerce.logoUrl} alt={commerce.name} className="h-full w-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center shadow-sm">
            <span className="text-2xl font-bold text-amber-400">{initials}</span>
          </div>
        )}
        {statusConf && (
          <div className={`absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusConf.color}`}>
            <statusConf.icon className="w-3 h-3" />
            {statusConf.label}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors leading-snug">
            {commerce.name}
          </h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${categoryColor}`}>
            {commerce.category}
          </span>
        </div>

        {commerce.description && (
          <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">
            {commerce.description}
          </p>
        )}

        <div className="mt-auto space-y-1.5">
          {commerce.locationCode && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5" />
              Local {commerce.locationCode}
            </div>
          )}
          {commerce.schedule && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="truncate">{commerce.schedule.split('|')[0].trim()}</span>
            </div>
          )}
          {commerce.whatsapp && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600">
              <MessageCircle className="w-3.5 h-3.5" />
              WhatsApp disponible
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
