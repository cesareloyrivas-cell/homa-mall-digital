'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPromotionsByCommerce, createPromotion, updatePromotion } from '@/lib/promotionService';
import { Promotion, PromotionStatus } from '@/types';
import { Plus, Tag, Clock, CheckCircle, XCircle, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<PromotionStatus, { label: string; color: string; icon: React.ElementType }> = {
  borrador: { label: 'Borrador', color: 'text-slate-600 bg-slate-100', icon: Edit2 },
  pendiente_aprobacion: { label: 'Pendiente aprobación', color: 'text-amber-700 bg-amber-100', icon: Clock },
  aprobada: { label: 'Aprobada', color: 'text-emerald-700 bg-emerald-100', icon: CheckCircle },
  rechazada: { label: 'Rechazada', color: 'text-red-700 bg-red-100', icon: XCircle },
  vencida: { label: 'Vencida', color: 'text-slate-500 bg-slate-100', icon: XCircle },
};

const EMPTY_FORM = {
  title: '',
  description: '',
  conditions: '',
  startsAt: new Date().toISOString().split('T')[0],
  endsAt: '',
};

const inputCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent';

export default function ComercioPromocionesPage() {
  const { usuario } = useAuth();
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const commerceId = usuario?.commerceId;

  function loadPromos() {
    if (!commerceId) { setLoading(false); return; }
    getPromotionsByCommerce(commerceId)
      .then(setPromos)
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadPromos(); }, [commerceId]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(p: Promotion) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      conditions: p.conditions ?? '',
      startsAt: p.startsAt,
      endsAt: p.endsAt,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commerceId) return;
    setSaving(true);
    try {
      if (editingId) {
        await updatePromotion(editingId, {
          ...form,
          status: 'pendiente_aprobacion',
        });
        toast.success('Promoción actualizada. Queda pendiente de aprobación.');
      } else {
        await createPromotion({
          commerceId,
          commerceName: '',
          ...form,
          status: 'pendiente_aprobacion',
          isFeatured: false,
        });
        toast.success('Promoción enviada. El equipo de HOMA Mall la revisará pronto.');
      }
      setShowForm(false);
      loadPromos();
    } catch {
      toast.error('No se pudo guardar la promoción.');
    } finally {
      setSaving(false);
    }
  }

  if (!commerceId) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Tu local no está vinculado. Contactá a la administración.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mis promociones</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Las aprobadas aparecen en tu ficha pública y en el sitio del mall.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Nueva promo
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">
              {editingId ? 'Editar promoción' : 'Nueva promoción'}
            </h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Título *</label>
              <input required type="text" className={inputCls} placeholder="Ej: 20% de descuento en toda la ropa" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Descripción *</label>
              <textarea required rows={3} className={inputCls} placeholder="Contá de qué se trata la promo..." value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Condiciones (opcional)</label>
              <input type="text" className={inputCls} placeholder="Ej: Válido solo con efectivo. No acumulable." value={form.conditions} onChange={(e) => setForm(f => ({ ...f, conditions: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Desde *</label>
                <input required type="date" className={inputCls} value={form.startsAt} onChange={(e) => setForm(f => ({ ...f, startsAt: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Hasta *</label>
                <input required type="date" className={inputCls} min={form.startsAt} value={form.endsAt} onChange={(e) => setForm(f => ({ ...f, endsAt: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-bold rounded-xl text-sm transition-colors">
                {saving ? 'Guardando...' : 'Enviar para aprobación'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : promos.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Todavía no tenés promociones.</p>
          <p className="text-slate-400 text-sm mt-1">Creá tu primera promo y llegará a todos los visitantes del mall.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((p) => {
            const conf = STATUS_CONFIG[p.status];
            const Icon = conf.icon;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${conf.color}`}>
                      <Icon className="w-3 h-3" /> {conf.label}
                    </span>
                    {p.isFeatured && (
                      <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        Destacada
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 truncate">{p.title}</h3>
                  <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{p.description}</p>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {new Date(p.startsAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    {' — '}
                    {new Date(p.endsAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {(p.status === 'borrador' || p.status === 'rechazada') && (
                  <button onClick={() => openEdit(p)} className="shrink-0 text-xs font-medium text-amber-600 hover:text-amber-700 border border-amber-200 hover:border-amber-300 px-3 py-1.5 rounded-xl transition-colors">
                    Editar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
