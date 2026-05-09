'use client';

import { useEffect, useState, useMemo } from 'react';
import { useCommerces } from '@/hooks/useCommerces';
import {
  getAllDocuments, createDocument, updateDocument,
  getDocumentSemaphore, isExpiringSoon, DOCUMENT_TYPES, Semaphore,
} from '@/lib/documentService';
import { useAuth } from '@/context/AuthContext';
import { CommercDocument, DocumentStatus, Commerce } from '@/types';
import {
  FileText, ChevronDown, ChevronUp, Plus, CheckCircle, XCircle,
  AlertTriangle, ExternalLink, X, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-slate-100 text-slate-600' },
  presentado: { label: 'Presentado', color: 'bg-blue-100 text-blue-700' },
  observado: { label: 'Observado', color: 'bg-amber-100 text-amber-700' },
  aprobado: { label: 'Aprobado', color: 'bg-emerald-100 text-emerald-700' },
  vencido: { label: 'Vencido', color: 'bg-red-100 text-red-700' },
};

const SEMAPHORE_CONFIG: Record<Semaphore, { dot: string; label: string }> = {
  verde: { dot: 'bg-emerald-500', label: 'Completo' },
  amarillo: { dot: 'bg-amber-400', label: 'En revisión' },
  rojo: { dot: 'bg-red-500', label: 'Requiere atención' },
};

const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400';

export default function AdminDocumentacionPage() {
  const { usuario } = useAuth();
  const { commerces, loading: loadingCommerces, refresh: refreshCommerces } = useCommerces();
  const [allDocs, setAllDocs] = useState<CommercDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newDocForm, setNewDocForm] = useState({ type: DOCUMENT_TYPES[0], notes: '', expiresAt: '' });
  const [reviewModal, setReviewModal] = useState<{ doc: CommercDocument } | null>(null);
  const [reviewForm, setReviewForm] = useState({ status: 'aprobado' as DocumentStatus, notes: '' });
  const [saving, setSaving] = useState(false);

  async function loadDocs() {
    setLoadingDocs(true);
    try {
      setAllDocs(await getAllDocuments());
    } finally {
      setLoadingDocs(false);
    }
  }

  useEffect(() => { loadDocs(); }, []);

  const docsByCommerce = useMemo(() => {
    const map: Record<string, CommercDocument[]> = {};
    allDocs.forEach(d => {
      if (!map[d.commerceId]) map[d.commerceId] = [];
      map[d.commerceId].push(d);
    });
    return map;
  }, [allDocs]);

  const semaphoreByCommerce = useMemo(() => {
    const map: Record<string, Semaphore> = {};
    commerces.forEach(c => {
      map[c.id] = getDocumentSemaphore(docsByCommerce[c.id] ?? []);
    });
    return map;
  }, [commerces, docsByCommerce]);

  async function handleAddDoc(commerceId: string, commerceName: string) {
    if (!usuario) return;
    setSaving(true);
    try {
      await createDocument({
        commerceId,
        type: newDocForm.type,
        notes: newDocForm.notes || undefined,
        expiresAt: newDocForm.expiresAt || undefined,
        status: 'pendiente',
        uploadedBy: usuario.uid,
      });
      toast.success(`Requisito "${newDocForm.type}" agregado.`);
      setAddingFor(null);
      setNewDocForm({ type: DOCUMENT_TYPES[0], notes: '', expiresAt: '' });
      loadDocs();
    } catch {
      toast.error('No se pudo agregar el requisito.');
    } finally {
      setSaving(false);
    }
  }

  async function handleReview() {
    if (!reviewModal) return;
    setSaving(true);
    try {
      await updateDocument(reviewModal.doc.id, {
        status: reviewForm.status,
        notes: reviewForm.notes || undefined,
      });
      toast.success('Estado actualizado.');
      setReviewModal(null);
      loadDocs();
    } catch {
      toast.error('No se pudo actualizar.');
    } finally {
      setSaving(false);
    }
  }

  const loading = loadingCommerces || loadingDocs;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Legajo documental</h1>
          <p className="text-sm text-slate-500 mt-0.5">Estado de la documentación por local</p>
        </div>
        <button
          onClick={() => { refreshCommerces(); loadDocs(); }}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary pills */}
      {!loading && (
        <div className="flex gap-3 mb-6">
          {(['verde', 'amarillo', 'rojo'] as Semaphore[]).map(s => {
            const count = commerces.filter(c => semaphoreByCommerce[c.id] === s).length;
            const conf = SEMAPHORE_CONFIG[s];
            return (
              <div key={s} className="flex items-center gap-2 bg-white border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
                <span className={`w-2.5 h-2.5 rounded-full ${conf.dot}`} />
                <span className="text-sm font-semibold text-slate-700">{count}</span>
                <span className="text-xs text-slate-500">{conf.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {commerces.map(commerce => {
            const semaphore = semaphoreByCommerce[commerce.id];
            const sConf = SEMAPHORE_CONFIG[semaphore];
            const docs = docsByCommerce[commerce.id] ?? [];
            const isOpen = expanded === commerce.id;
            const isAdding = addingFor === commerce.id;

            return (
              <div key={commerce.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : commerce.id)}
                >
                  <span className={`w-3 h-3 rounded-full shrink-0 ${sConf.dot}`} title={sConf.label} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{commerce.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {commerce.locationCode ?? '—'} · {docs.length} documento{docs.length !== 1 ? 's' : ''}
                      {docs.some(d => isExpiringSoon(d.expiresAt)) && (
                        <span className="ml-2 text-amber-600 font-medium">· Próximo a vencer</span>
                      )}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-5 pb-5">
                    {docs.length > 0 ? (
                      <table className="w-full text-sm mt-4">
                        <thead>
                          <tr className="text-xs text-slate-500 uppercase tracking-wider text-left">
                            <th className="pb-2 font-semibold">Documento</th>
                            <th className="pb-2 font-semibold">Estado</th>
                            <th className="pb-2 font-semibold hidden md:table-cell">Vencimiento</th>
                            <th className="pb-2 font-semibold hidden lg:table-cell">Notas</th>
                            <th className="pb-2" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {docs.map(d => (
                            <tr key={d.id} className="hover:bg-slate-50">
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span className="font-medium text-slate-800">{d.type}</span>
                                  {d.fileUrl && (
                                    <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-600">
                                      <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 pr-4">
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_CONFIG[d.status].color}`}>
                                  {STATUS_CONFIG[d.status].label}
                                </span>
                                {isExpiringSoon(d.expiresAt) && (
                                  <AlertTriangle className="inline w-3.5 h-3.5 text-amber-500 ml-1.5" />
                                )}
                              </td>
                              <td className="py-3 pr-4 text-slate-500 text-xs hidden md:table-cell">
                                {d.expiresAt
                                  ? new Date(d.expiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
                                  : '—'}
                              </td>
                              <td className="py-3 pr-4 text-slate-400 text-xs hidden lg:table-cell max-w-[160px] truncate">
                                {d.notes ?? '—'}
                              </td>
                              <td className="py-3 text-right">
                                {(d.status === 'presentado') && (
                                  <button
                                    onClick={() => {
                                      setReviewModal({ doc: d });
                                      setReviewForm({ status: 'aprobado', notes: '' });
                                    }}
                                    className="text-xs font-medium text-amber-600 hover:text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg"
                                  >
                                    Revisar
                                  </button>
                                )}
                                {(d.status === 'aprobado' || d.status === 'observado' || d.status === 'vencido') && (
                                  <button
                                    onClick={() => {
                                      setReviewModal({ doc: d });
                                      setReviewForm({ status: d.status, notes: d.notes ?? '' });
                                    }}
                                    className="text-xs text-slate-400 hover:text-slate-600"
                                  >
                                    Editar
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-sm text-slate-400 mt-4 mb-2">Sin documentos cargados.</p>
                    )}

                    {/* Add requirement */}
                    {isAdding ? (
                      <div className="mt-4 border border-amber-200 bg-amber-50/50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-slate-800">Agregar requisito</p>
                          <button onClick={() => setAddingFor(null)} className="text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">Tipo *</label>
                            <select className={inputCls} value={newDocForm.type} onChange={e => setNewDocForm(f => ({ ...f, type: e.target.value }))}>
                              {DOCUMENT_TYPES.map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">Vencimiento</label>
                            <input type="date" className={inputCls} value={newDocForm.expiresAt} onChange={e => setNewDocForm(f => ({ ...f, expiresAt: e.target.value }))} />
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">Nota para el comercio</label>
                          <input type="text" className={inputCls} placeholder="Ej: Presentar habilitación vigente 2025" value={newDocForm.notes} onChange={e => setNewDocForm(f => ({ ...f, notes: e.target.value }))} />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setAddingFor(null)} className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5">Cancelar</button>
                          <button
                            onClick={() => handleAddDoc(commerce.id, commerce.name)}
                            disabled={saving}
                            className="text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-900 px-4 py-1.5 rounded-lg disabled:opacity-60"
                          >
                            {saving ? 'Guardando...' : 'Agregar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingFor(commerce.id)}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700"
                      >
                        <Plus className="w-3.5 h-3.5" /> Agregar requisito
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {commerces.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No hay comercios registrados aún.</p>
            </div>
          )}
        </div>
      )}

      {/* Review modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Revisar documento</h3>
              <button onClick={() => setReviewModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              <span className="font-medium">{reviewModal.doc.type}</span>
            </p>
            {reviewModal.doc.fileUrl && (
              <a
                href={reviewModal.doc.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 mb-4"
              >
                <ExternalLink className="w-4 h-4" /> Ver documento
              </a>
            )}
            <div className="mb-3">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Nuevo estado</label>
              <select
                className={inputCls}
                value={reviewForm.status}
                onChange={e => setReviewForm(f => ({ ...f, status: e.target.value as DocumentStatus }))}
              >
                <option value="aprobado">Aprobado</option>
                <option value="observado">Observado</option>
                <option value="vencido">Vencido</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Nota (visible al comercio)</label>
              <textarea
                rows={3}
                className={inputCls}
                placeholder="Ej: Falta firma del titular."
                value={reviewForm.notes}
                onChange={e => setReviewForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setReviewModal(null)} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2">Cancelar</button>
              <button
                onClick={handleReview}
                disabled={saving}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-bold rounded-xl text-sm"
              >
                {saving ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
