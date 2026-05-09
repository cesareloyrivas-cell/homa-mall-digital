'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCommunications, createCommunication, getAllReads } from '@/lib/communicationService';
import { getCommerces } from '@/lib/commerceService';
import { Communication, CommunicationPriority, CommunicationRead, Commerce, COMMERCE_CATEGORIES } from '@/types';
import {
  Megaphone, Plus, X, ChevronDown, ChevronUp, Users, Building2,
  AlertTriangle, Info, AlertCircle, Bell, RefreshCw, CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PRIORITY_CONFIG: Record<CommunicationPriority, { label: string; color: string; icon: typeof Info }> = {
  baja: { label: 'Baja', color: 'bg-slate-100 text-slate-600', icon: Info },
  media: { label: 'Media', color: 'bg-blue-100 text-blue-700', icon: Bell },
  alta: { label: 'Alta', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  critica: { label: 'Crítica', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

const TARGET_OPTIONS = [
  { value: 'all', label: 'Todos los locales' },
  { value: 'category', label: 'Por categoría' },
  { value: 'specific', label: 'Locales específicos' },
  { value: 'pending_docs', label: 'Documentación pendiente' },
] as const;

const inputCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent';

const EMPTY_FORM = {
  title: '',
  body: '',
  priority: 'media' as CommunicationPriority,
  targetType: 'all' as Communication['targetType'],
  targetCommerceIds: [] as string[],
  targetCategories: [] as string[],
  requiresReadConfirmation: false,
  responseDeadline: '',
};

export default function AdminComunicacionesPage() {
  const { usuario } = useAuth();
  const [comms, setComms] = useState<Communication[]>([]);
  const [reads, setReads] = useState<CommunicationRead[]>([]);
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [c, r, cs] = await Promise.all([getCommunications(), getAllReads(), getCommerces()]);
      setComms(c);
      setReads(r);
      setCommerces(cs);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const readCountById = useMemo(() => {
    const map: Record<string, number> = {};
    reads.forEach(r => {
      if (r.readAt) map[r.communicationId] = (map[r.communicationId] ?? 0) + 1;
    });
    return map;
  }, [reads]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!usuario) return;
    setSaving(true);
    try {
      await createCommunication({
        ...form,
        targetCommerceIds: form.targetType === 'specific' ? form.targetCommerceIds : undefined,
        targetCategories: form.targetType === 'category' ? form.targetCategories : undefined,
        responseDeadline: form.responseDeadline || undefined,
        createdBy: usuario.uid,
      });
      toast.success('Circular enviada.');
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch {
      toast.error('No se pudo enviar la circular.');
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(cat: string) {
    setForm(f => ({
      ...f,
      targetCategories: f.targetCategories.includes(cat)
        ? f.targetCategories.filter(c => c !== cat)
        : [...f.targetCategories, cat],
    }));
  }

  function toggleCommerce(id: string) {
    setForm(f => ({
      ...f,
      targetCommerceIds: f.targetCommerceIds.includes(id)
        ? f.targetCommerceIds.filter(c => c !== id)
        : [...f.targetCommerceIds, id],
    }));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Comunicaciones</h1>
          <p className="text-sm text-slate-500 mt-0.5">Circulares y avisos para los propietarios de locales</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Nueva circular
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">Nueva circular</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Asunto *</label>
              <input
                required
                type="text"
                className={inputCls}
                placeholder="Ej: Actualización de habilitaciones municipales"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Contenido *</label>
              <textarea
                required
                rows={5}
                className={inputCls}
                placeholder="Escribí el mensaje de la circular..."
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Prioridad</label>
                <select
                  className={inputCls}
                  value={form.priority}
                  onChange={e => setForm(f => ({ ...f, priority: e.target.value as CommunicationPriority }))}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Destinatarios</label>
                <select
                  className={inputCls}
                  value={form.targetType}
                  onChange={e => setForm(f => ({ ...f, targetType: e.target.value as Communication['targetType'] }))}
                >
                  {TARGET_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category picker */}
            {form.targetType === 'category' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Categorías *</label>
                <div className="flex flex-wrap gap-2">
                  {COMMERCE_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                        form.targetCategories.includes(cat)
                          ? 'bg-amber-500 text-slate-900 border-amber-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Commerce picker */}
            {form.targetType === 'specific' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Locales *</label>
                <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {commerces.map(c => (
                    <label key={c.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded accent-amber-500"
                        checked={form.targetCommerceIds.includes(c.id)}
                        onChange={() => toggleCommerce(c.id)}
                      />
                      <span className="text-sm text-slate-700">{c.name}</span>
                      <span className="text-xs text-slate-400 ml-auto">{c.locationCode}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Fecha límite de respuesta</label>
                <input
                  type="date"
                  className={inputCls}
                  value={form.responseDeadline}
                  onChange={e => setForm(f => ({ ...f, responseDeadline: e.target.value }))}
                />
              </div>
              <div className="flex items-end pb-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded accent-amber-500 w-4 h-4"
                    checked={form.requiresReadConfirmation}
                    onChange={e => setForm(f => ({ ...f, requiresReadConfirmation: e.target.checked }))}
                  />
                  <span className="text-sm text-slate-700 font-medium">Requiere confirmación de lectura</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-bold rounded-xl text-sm transition-colors"
              >
                {saving ? 'Enviando...' : 'Enviar circular'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : comms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No hay circulares enviadas aún.</p>
          <p className="text-slate-400 text-sm mt-1">Creá la primera para comunicarte con los locales.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comms.map(c => {
            const pConf = PRIORITY_CONFIG[c.priority];
            const PIcon = pConf.icon;
            const isOpen = expanded === c.id;
            const readCount = readCountById[c.id] ?? 0;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  className="w-full text-left px-5 py-4 flex items-center gap-4"
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                >
                  <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${pConf.color}`}>
                    <PIcon className="w-3 h-3" /> {pConf.label}
                  </span>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-slate-900 truncate">{c.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(c.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}
                      {TARGET_OPTIONS.find(o => o.value === c.targetType)?.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {c.requiresReadConfirmation && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                        Requiere confirmación
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {readCount} {readCount === 1 ? 'lectura' : 'lecturas'}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-slate-100">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mt-4">{c.body}</p>
                    {c.responseDeadline && (
                      <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Fecha límite: {new Date(c.responseDeadline).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                    {c.targetType === 'specific' && c.targetCommerceIds && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.targetCommerceIds.map(id => {
                          const cm = commerces.find(x => x.id === id);
                          return cm ? (
                            <span key={id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{cm.name}</span>
                          ) : null;
                        })}
                      </div>
                    )}
                    {c.targetType === 'category' && c.targetCategories && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.targetCategories.map(cat => (
                          <span key={cat} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{cat}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
