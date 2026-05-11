'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCommerce } from '@/hooks/useCommerce';
import { getComunicadosForCommerce } from '@/lib/comunicadoService';
import { Communication } from '@/types';
import {
  Megaphone, Bell, AlertTriangle, RefreshCw, ChevronDown, ChevronUp,
} from 'lucide-react';

const PRIORITY_CONFIG = {
  baja: {
    label: 'Info',
    badgeColor: 'text-slate-600 bg-slate-100',
    borderLeft: 'border-l-slate-300',
  },
  media: {
    label: 'Aviso',
    badgeColor: 'text-blue-700 bg-blue-100',
    borderLeft: 'border-l-blue-400',
  },
  alta: {
    label: 'Importante',
    badgeColor: 'text-amber-700 bg-amber-100',
    borderLeft: 'border-l-amber-400',
  },
  critica: {
    label: 'Urgente',
    badgeColor: 'text-red-700 bg-red-100',
    borderLeft: 'border-l-red-500',
  },
};

function isNew(publishedAt?: string) {
  if (!publishedAt) return false;
  return Date.now() - new Date(publishedAt).getTime() < 7 * 24 * 60 * 60 * 1000;
}

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ─── Tarjeta de un comunicado ─────────────────────────────────────────────────

function ComunicadoCard({ c }: { c: Communication }) {
  const [expanded, setExpanded] = useState(false);
  const conf = PRIORITY_CONFIG[c.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.media;
  const nuevo = isNew(c.publishedAt);
  const isLong = c.body.length > 220;

  return (
    <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm border-l-4 ${conf.borderLeft}`}>
      <div className="p-5">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${conf.badgeColor}`}>
            {conf.label}
          </span>
          {nuevo && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Nuevo
            </span>
          )}
          <span className="text-xs text-slate-400 ml-auto">
            {formatDate(c.publishedAt)}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-slate-900 text-sm mb-2">{c.title}</h3>

        {/* Cuerpo (colapsable si es largo) */}
        <p className={`text-sm text-slate-600 leading-relaxed whitespace-pre-line ${
          !expanded && isLong ? 'line-clamp-3' : ''
        }`}>
          {c.body}
        </p>

        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 transition-colors"
          >
            {expanded
              ? <><ChevronUp className="w-3 h-3" /> Ver menos</>
              : <><ChevronDown className="w-3 h-3" /> Ver más</>}
          </button>
        )}

        {/* Fecha de expiración */}
        {c.expiresAt && (
          <p className="mt-2.5 text-xs text-slate-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Vigente hasta: {formatDate(c.expiresAt)}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function ComercioComunicadosPage() {
  const { usuario } = useAuth();
  const { commerce } = useCommerce();
  const [comunicados, setComunicados] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);

  const commerceId = usuario?.commerceId ?? '';

  async function load() {
    if (!commerceId) { setLoading(false); return; }
    setLoading(true);
    try {
      setComunicados(await getComunicadosForCommerce(commerceId, commerce?.category));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [commerceId, commerce?.category]);

  if (!commerceId) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Tu local no está vinculado. Contactá a la administración.
      </div>
    );
  }

  // Separar por prioridad y novedad
  const criticas   = comunicados.filter((c) => c.priority === 'critica');
  const rest       = comunicados.filter((c) => c.priority !== 'critica');
  const nuevos     = rest.filter((c) => isNew(c.publishedAt));
  const anteriores = rest.filter((c) => !isNew(c.publishedAt));

  const totalNuevos = comunicados.filter((c) => isNew(c.publishedAt)).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" />
            Comunicados
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {!loading && totalNuevos > 0
              ? `${totalNuevos} comunicado${totalNuevos > 1 ? 's' : ''} nuevo${totalNuevos > 1 ? 's' : ''} esta semana`
              : 'Avisos y novedades del mall para tu local.'}
          </p>
        </div>
        <button
          onClick={load}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : comunicados.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium">Sin comunicados activos</p>
          <p className="text-xs mt-1">Cuando el mall publique novedades, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Urgentes */}
          {criticas.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h2 className="text-xs font-bold text-red-600 uppercase tracking-wider">
                  Urgente{criticas.length > 1 ? 's' : ''}
                </h2>
              </div>
              <div className="space-y-3">
                {criticas.map((c) => <ComunicadoCard key={c.id} c={c} />)}
              </div>
            </div>
          )}

          {/* Últimos 7 días */}
          {nuevos.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Últimos 7 días
              </h2>
              <div className="space-y-3">
                {nuevos.map((c) => <ComunicadoCard key={c.id} c={c} />)}
              </div>
            </div>
          )}

          {/* Anteriores */}
          {anteriores.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Anteriores
              </h2>
              <div className="space-y-3">
                {anteriores.map((c) => <ComunicadoCard key={c.id} c={c} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
