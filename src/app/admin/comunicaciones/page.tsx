'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getAllComunicados, createComunicado, updateComunicado,
  deleteComunicado, publishComunicado, archiveComunicado,
} from '@/lib/comunicadoService';
import { Communication, COMMERCE_CATEGORIES } from '@/types';
import {
  Megaphone, Plus, Send, Archive, Trash2, Edit2,
  Globe, Tag, RefreshCw, X, ChevronDown, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

type FilterTab = 'activos' | 'publicado' | 'borrador' | 'archivado';

const PRIORITY_CONFIG = {
  baja:    { label: 'Baja',    color: 'text-slate-600 bg-slate-100' },
  media:   { label: 'Media',   color: 'text-blue-700 bg-blue-100' },
  alta:    { label: 'Alta',    color: 'text-amber-700 bg-amber-100' },
  critica: { label: 'Crítica', color: 'text-red-700 bg-red-100' },
};

const STATUS_CONFIG = {
  borrador:  { label: 'Borrador',  color: 'text-slate-500 bg-slate-100' },
  publicado: { label: 'Publicado', color: 'text-emerald-700 bg-emerald-100' },
  archivado: { label: 'Archivado', color: 'text-slate-400 bg-slate-50 border border-slate-200' },
};

const EMPTY_FORM = {
  title: '',
  body: '',
  priority: 'media' as Communication['priority'],
  targetType: 'all' as Communication['targetType'],
  targetCategories: [] as string[],
  expiresAt: '',
};

export default function AdminComunicacionesPage() {
  const { usuario } = useAuth();
  const [comunicados, setComunicados] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>('activos');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Communication | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setComunicados(await getAllComunicados());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEdit(c: Communication) {
    setEditing(c);
    setForm({
      title: c.title,
      body: c.body,
      priority: c.priority,
      targetType: c.targetType,
      targetCategories: c.targetCategories ?? [],
      expiresAt: c.expiresAt ?? '',
    });
    setModalOpen(true);
  }

  async function handleSave(publish: boolean) {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error('El título y el mensaje son obligatorios.');
      return;
    }
    if (form.targetType === 'category' && form.targetCategories.length === 0) {
      toast.error('Seleccioná al menos una categoría.');
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      if (editing) {
        const updates: Partial<Communication> = {
          title: form.title,
          body: form.body,
          priority: form.priority,
          targetType: form.targetType,
          targetCategories: form.targetType === 'category' ? form.targetCategories : [],
          expiresAt: form.expiresAt || undefined,
        };
        if (publish && editing.status !== 'publicado') {
          updates.status = 'publicado';
          updates.publishedAt = now;
        } else if (!publish && editing.status !== 'publicado') {
          updates.status = 'borrador';
        }
        await updateComunicado(editing.id, updates);
        toast.success('Comunicado actualizado.');
      } else {
        await createComunicado({
          title: form.title,
          body: form.body,
          priority: form.priority,
          targetType: form.targetType,
          targetCategories: form.targetType === 'category' ? form.targetCategories : [],
          expiresAt: form.expiresAt || undefined,
          status: publish ? 'publicado' : 'borrador',
          publishedAt: publish ? now : undefined,
          tenantId: process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? 'homa_mall',
          createdBy: usuario?.uid ?? '',
          authorName: usuario?.displayName ?? usuario?.email ?? 'Admin',
          requiresReadConfirmation: false,
          createdAt: now,
        });
        toast.success(publish ? '¡Comunicado publicado!' : 'Guardado como borrador.');
      }
      setModalOpen(false);
      load();
    } catch {
      toast.error('No se pudo guardar el comunicado.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(id: string) {
    try {
      await publishComunicado(id);
      toast.success('Comunicado publicado.');
      setComunicados((prev) =>
        prev.map((c) => c.id === id
          ? { ...c, status: 'publicado', publishedAt: new Date().toISOString() }
          : c)
      );
    } catch { toast.error('Error al publicar.'); }
  }

  async function handleArchive(id: string) {
    try {
      await archiveComunicado(id);
      toast.success('Comunicado archivado.');
      setComunicados((prev) => prev.map((c) => c.id === id ? { ...c, status: 'archivado' } : c));
    } catch { toast.error('Error al archivar.'); }
  }

  async function handleDelete(id: string) {
    try {
      await deleteComunicado(id);
      toast.success('Comunicado eliminado.');
      setComunicados((prev) => prev.filter((c) => c.id !== id));
    } catch { toast.error('Error al eliminar.'); }
    finally { setDeleteConfirm(null); }
  }

  const counts = {
    publicado: comunicados.filter((c) => c.status === 'publicado').length,
    borrador:  comunicados.filter((c) => c.status === 'borrador').length,
    archivado: comunicados.filter((c) => c.status === 'archivado').length,
  };

  const filtered = comunicados.filter((c) =>
    tab === 'activos'   ? c.status !== 'archivado' :
    tab === 'publicado' ? c.status === 'publicado' :
    tab === 'borrador'  ? c.status === 'borrador'  :
    c.status === 'archivado'
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" />
            Comunicaciones
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Publicá avisos, recordatorios y novedades para los locales del mall.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Nuevo comunicado
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Publicados', count: counts.publicado, cls: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Borradores', count: counts.borrador,  cls: 'text-slate-700',   bg: 'bg-slate-50 border-slate-200' },
          { label: 'Archivados', count: counts.archivado, cls: 'text-slate-400',   bg: 'bg-slate-50 border-slate-100' },
        ].map((s) => (
          <div key={s.label} className={`border rounded-2xl p-4 ${s.bg}`}>
            <div className={`text-2xl font-bold ${s.cls}`}>{s.count}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
        {(['activos', 'publicado', 'borrador', 'archivado'] as FilterTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 text-sm font-medium py-1.5 rounded-lg capitalize transition-colors ${
              tab === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {t === 'activos' ? 'Activos' : t.charAt(0).toUpperCase() + t.slice(1)}
            {t !== 'activos' && counts[t as keyof typeof counts] > 0 && (
              <span className="ml-1 text-xs text-slate-400">({counts[t as keyof typeof counts]})</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No hay comunicados en esta sección.</p>
          {tab === 'activos' && (
            <p className="text-xs mt-1">Usá el botón de arriba para crear el primero.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => {
            const pConf = PRIORITY_CONFIG[c.priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.media;
            const sConf = STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.borrador;
            const isOpen = expandedId === c.id;

            return (
              <div key={c.id} className={`bg-white rounded-2xl border shadow-sm ${
                c.priority === 'critica' ? 'border-red-200' :
                c.priority === 'alta'    ? 'border-amber-200' : 'border-slate-100'
              }`}>
                <div className="flex items-start gap-4 p-5">
                  <div className="flex-1 min-w-0">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${pConf.color}`}>
                        {pConf.label}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${sConf.color}`}>
                        {sConf.label}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        {c.targetType === 'all'
                          ? <><Globe className="w-3 h-3" /> Todos los locales</>
                          : c.targetType === 'category'
                          ? <><Tag className="w-3 h-3" /> {c.targetCategories?.join(', ')}</>
                          : 'Específicos'}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-sm">{c.title}</h3>

                    {isOpen && (
                      <p className="text-sm text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{c.body}</p>
                    )}

                    <div className="flex gap-4 mt-1.5 text-xs text-slate-400">
                      {c.status === 'publicado' && c.publishedAt && (
                        <span>Publicado: {new Date(c.publishedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                      {!c.publishedAt && (
                        <span>Creado: {new Date(c.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                      {c.expiresAt && (
                        <span>Vence: {new Date(c.expiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <button
                      onClick={() => setExpandedId(isOpen ? null : c.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title={isOpen ? 'Contraer' : 'Ver mensaje'}>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => openEdit(c)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Editar">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {c.status === 'borrador' && (
                      <button onClick={() => handlePublish(c.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Send className="w-3 h-3" /> Publicar
                      </button>
                    )}
                    {c.status === 'publicado' && (
                      <button onClick={() => handleArchive(c.id)}
                        className="flex items-center gap-1 text-xs text-slate-500 hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Archive className="w-3 h-3" /> Archivar
                      </button>
                    )}
                    {deleteConfirm === c.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(c.id)}
                          className="text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 px-2 py-1.5 rounded-lg transition-colors">
                          Confirmar
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-slate-400 hover:bg-slate-100 border border-slate-200 px-2 py-1.5 rounded-lg transition-colors">
                          No
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(c.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Modal crear / editar ─────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">
                {editing ? 'Editar comunicado' : 'Nuevo comunicado'}
              </h2>
              <button onClick={() => setModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Título *</label>
                <input type="text"
                  placeholder="Ej: Recordatorio vencimiento de habilitaciones"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mensaje *</label>
                <textarea
                  placeholder="Escribí el contenido del comunicado..."
                  value={form.body}
                  onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Prioridad</label>
                  <select value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Communication['priority'] }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="baja">Baja — informativo</option>
                    <option value="media">Media — aviso</option>
                    <option value="alta">Alta — importante</option>
                    <option value="critica">Crítica — urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Destinatarios</label>
                  <select value={form.targetType}
                    onChange={(e) => setForm((f) => ({
                      ...f,
                      targetType: e.target.value as Communication['targetType'],
                      targetCategories: [],
                    }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                    <option value="all">Todos los locales</option>
                    <option value="category">Por categoría</option>
                  </select>
                </div>
              </div>

              {form.targetType === 'category' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">
                    Categorías destinatarias *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMMERCE_CATEGORIES.filter((c) => c !== 'Otro').map((cat) => (
                      <button key={cat} type="button"
                        onClick={() => setForm((f) => ({
                          ...f,
                          targetCategories: f.targetCategories.includes(cat)
                            ? f.targetCategories.filter((x) => x !== cat)
                            : [...f.targetCategories, cat],
                        }))}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          form.targetCategories.includes(cat)
                            ? 'bg-amber-500 border-amber-500 text-slate-900 font-semibold'
                            : 'border-slate-200 text-slate-600 hover:border-amber-300'
                        }`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Vence el{' '}
                  <span className="font-normal text-slate-400">(opcional — vacío = vigencia indefinida)</span>
                </label>
                <input type="date" value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
              <button onClick={() => handleSave(false)} disabled={saving}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60">
                Guardar borrador
              </button>
              <button onClick={() => handleSave(true)} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-semibold text-sm py-2.5 rounded-xl transition-colors">
                <Send className="w-4 h-4" />
                {saving ? 'Guardando...' :
                  editing?.status === 'publicado' ? 'Guardar cambios' : 'Publicar ahora'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
