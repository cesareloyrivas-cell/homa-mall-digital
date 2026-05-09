'use client';

import { useEffect, useState, useMemo } from 'react';
import { getPromotions, updatePromotionStatus, updatePromotion } from '@/lib/promotionService';
import { Promotion, PromotionStatus } from '@/types';
import { Tag, CheckCircle, XCircle, Clock, Star, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS: { key: PromotionStatus | 'todas'; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'pendiente_aprobacion', label: 'Pendientes' },
  { key: 'aprobada', label: 'Aprobadas' },
  { key: 'rechazada', label: 'Rechazadas' },
];

const STATUS_COLOR: Record<PromotionStatus, string> = {
  borrador: 'text-slate-600 bg-slate-100',
  pendiente_aprobacion: 'text-amber-700 bg-amber-100',
  aprobada: 'text-emerald-700 bg-emerald-100',
  rechazada: 'text-red-700 bg-red-100',
  vencida: 'text-slate-500 bg-slate-100',
};

const STATUS_LABEL: Record<PromotionStatus, string> = {
  borrador: 'Borrador',
  pendiente_aprobacion: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  vencida: 'Vencida',
};

export default function AdminPromocionesPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<PromotionStatus | 'todas'>('pendiente_aprobacion');
  const [acting, setActing] = useState<string | null>(null);

  function load() {
    setLoading(true);
    getPromotions()
      .then(setPromos)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => tab === 'todas' ? promos : promos.filter(p => p.status === tab),
    [promos, tab]
  );

  const pendingCount = promos.filter(p => p.status === 'pendiente_aprobacion').length;

  async function handleStatus(id: string, status: PromotionStatus) {
    setActing(id + status);
    try {
      await updatePromotionStatus(id, status);
      toast.success(status === 'aprobada' ? 'Promoción aprobada. Ya es visible en el sitio.' : 'Promoción rechazada.');
      load();
    } catch {
      toast.error('No se pudo actualizar el estado.');
    } finally {
      setActing(null);
    }
  }

  async function toggleFeatured(p: Promotion) {
    setActing(p.id + 'featured');
    try {
      await updatePromotion(p.id, { isFeatured: !p.isFeatured });
      toast.success(p.isFeatured ? 'Quitada de destacadas.' : 'Marcada como destacada.');
      load();
    } catch {
      toast.error('No se pudo actualizar.');
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Promociones</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pendingCount > 0
              ? `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''} de revisión`
              : 'Todo revisado'}
          </p>
        </div>
        <button onClick={load} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {TABS.map(({ key, label }) => {
          const count = key === 'todas' ? promos.length : promos.filter(p => p.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  key === 'pendiente_aprobacion' && count > 0
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No hay promociones en esta categoría.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const isActing = acting?.startsWith(p.id);
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLOR[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                      {p.isFeatured && (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" /> Destacada
                        </span>
                      )}
                      {p.commerceName && (
                        <span className="text-xs text-slate-500 font-medium">{p.commerceName}</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900">{p.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{p.description}</p>
                    {p.conditions && (
                      <p className="text-xs text-slate-400 italic mt-1">* {p.conditions}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(p.startsAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      {' — '}
                      {new Date(p.endsAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2 shrink-0">
                    {p.status === 'pendiente_aprobacion' && (
                      <>
                        <button
                          onClick={() => handleStatus(p.id, 'aprobada')}
                          disabled={!!isActing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {acting === p.id + 'aprobada' ? '...' : 'Aprobar'}
                        </button>
                        <button
                          onClick={() => handleStatus(p.id, 'rechazada')}
                          disabled={!!isActing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {acting === p.id + 'rechazada' ? '...' : 'Rechazar'}
                        </button>
                      </>
                    )}
                    {p.status === 'aprobada' && (
                      <>
                        <button
                          onClick={() => toggleFeatured(p)}
                          disabled={!!isActing}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50 ${
                            p.isFeatured
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                          }`}
                        >
                          <Star className="w-3.5 h-3.5" />
                          {acting === p.id + 'featured' ? '...' : p.isFeatured ? 'Quitar destaque' : 'Destacar'}
                        </button>
                        <button
                          onClick={() => handleStatus(p.id, 'rechazada')}
                          disabled={!!isActing}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-700 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Dar de baja
                        </button>
                      </>
                    )}
                    {p.status === 'rechazada' && (
                      <button
                        onClick={() => handleStatus(p.id, 'aprobada')}
                        disabled={!!isActing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Reactivar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
