'use client';

import { useEffect, useState, useMemo } from 'react';
import { useCommerces } from '@/hooks/useCommerces';
import {
  getAllDocuments, createDocument, updateDocument,
  getDocumentSemaphore, isExpiringSoon, Semaphore,
} from '@/lib/documentService';
import { getBusinessModel, MODEL_CONFIGS } from '@/lib/businessModels';
import { getTemplateForModel } from '@/lib/documentTemplates';
import { useAuth } from '@/context/AuthContext';
import { CommercDocument, DocumentStatus } from '@/types';
import {
  FileText, ChevronDown, ChevronUp, CheckCircle, XCircle,
  AlertTriangle, ExternalLink, X, RefreshCw, Circle,
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
  const [reviewModal, setReviewModal] = useState<{ doc: CommercDocument } | null>(null);
  const [reviewForm, setReviewForm] = useState({ status: 'aprobado' as DocumentStatus, notes: '' });
  const [saving, setSaving] = useState(false);

  async function loadDocs() {
    setLoadingDocs(true);
    try { setAllDocs(await getAllDocuments()); }
    finally { setLoadingDocs(false); }
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
    commerces.forEach(c => { map[c.id] = getDocumentSemaphore(docsByCommerce[c.id] ?? []); });
    return map;
  }, [commerces, docsByCommerce]);

  async function handleReview() {
    if (!reviewModal) return;
    setSaving(true);
    try {
      await updateDocument(reviewModal.doc.id, { status: reviewForm.status, notes: reviewForm.notes || undefined });
      toast.success('Estado actualizado.');
      setReviewModal(null);
      loadDocs();
    } catch { toast.error('No se pudo actualizar.'); }
    finally { setSaving(false); }
  }

  const loading = loadingCommerces || loadingDocs;

  // Summary counts
  const semaphoreCounts = useMemo(() => {
    const counts = { verde: 0, amarillo: 0, rojo: 0 };
    commerces.forEach(c => { counts[semaphoreByCommerce[c.id] ?? 'rojo']++; });
    return counts;
  }, [commerces, semaphoreByCommerce]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Legajo documental</h1>
          <p className="text-sm text-slate-500 mt-0.5">Documentación requerida por rubro para cada local</p>
        </div>
        <button onClick={() => { refreshCommerces(); loadDocs(); }}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary pills */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {([
            { key: 'verde', icon: CheckCircle, label: 'Al día', textColor: 'text-emerald-700' },
            { key: 'amarillo', icon: Circle, label: 'En revisión', textColor: 'text-amber-700' },
            { key: 'rojo', icon: XCircle, label: 'Requiere atención', textColor: 'text-red-700' },
          ] as const).map(({ key, icon: Icon, label, textColor }) => (
            <div key={key} className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full shrink-0 ${SEMAPHORE_CONFIG[key].dot}`} />
              <div>
                <div className={`text-2xl font-bold ${textColor}`}>{semaphoreCounts[key]}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {commerces.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No hay comercios registrados aún.</p>
            </div>
          )}

          {commerces.map(commerce => {
            const semaphore = semaphoreByCommerce[commerce.id];
            const sConf = SEMAPHORE_CONFIG[semaphore];
            const docs = docsByCommerce[commerce.id] ?? [];
            const isOpen = expanded === commerce.id;

            // Business model & template for this commerce
            const model = getBusinessModel(commerce.category);
            const modelConfig = MODEL_CONFIGS[model];
            const templates = getTemplateForModel(model);
            const requiredTemplates = templates.filter(t => t.required);
            const docsByType: Record<string, CommercDocument> = Object.fromEntries(docs.map(d => [d.type, d]));

            // Progress: required docs approved
            const approvedRequired = requiredTemplates.filter(t => docsByType[t.type]?.status === 'aprobado').length;
            const progress = requiredTemplates.length > 0 ? Math.round((approvedRequired / requiredTemplates.length) * 100) : 0;

            // Docs submitted/pending review
            const pendingReview = docs.filter(d => d.status === 'presentado').length;

            return (
              <div key={commerce.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Commerce header */}
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(isOpen ? null : commerce.id)}
                >
                  <span className={`w-3 h-3 rounded-full shrink-0 ${sConf.dot}`} title={sConf.label} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 truncate">{commerce.name}</p>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        {modelConfig.emoji} {commerce.category}
                      </span>
                      {pendingReview > 0 && (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                          {pendingReview} para revisar
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${progress === 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{approvedRequired}/{requiredTemplates.length}</span>
                      </div>
                      {docs.some(d => isExpiringSoon(d.expiresAt)) && (
                        <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Por vencer
                        </span>
                      )}
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>

                {/* Expanded: template-based document list */}
                {isOpen && (
                  <div className="border-t border-slate-100 p-5 space-y-5">
                    {/* Required docs */}
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Documentos obligatorios · {modelConfig.emoji} {commerce.category}
                      </p>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-slate-400 uppercase tracking-wider text-left">
                            <th className="pb-2 font-medium">Documento</th>
                            <th className="pb-2 font-medium">Estado</th>
                            <th className="pb-2 font-medium hidden md:table-cell">Vencimiento</th>
                            <th className="pb-2" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {requiredTemplates.map(template => {
                            const d = docsByType[template.type];
                            const status: DocumentStatus = d?.status ?? 'pendiente';
                            return (
                              <tr key={template.type} className="hover:bg-slate-50">
                                <td className="py-2.5 pr-4">
                                  <div className="flex items-center gap-2">
                                    <FileText className={`w-3.5 h-3.5 shrink-0 ${status === 'aprobado' ? 'text-emerald-500' : status === 'presentado' ? 'text-blue-500' : 'text-slate-300'}`} />
                                    <div>
                                      <span className="font-medium text-slate-800 text-sm">{template.label}</span>
                                      {d?.fileUrl && (
                                        <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-amber-500 hover:text-amber-600 inline-flex items-center gap-0.5">
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 pr-4">
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[status].color}`}>
                                    {STATUS_CONFIG[status].label}
                                  </span>
                                </td>
                                <td className="py-2.5 pr-4 text-slate-400 text-xs hidden md:table-cell">
                                  {d?.expiresAt
                                    ? <span className={isExpiringSoon(d.expiresAt) ? 'text-amber-600 font-medium' : ''}>
                                        {new Date(d.expiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </span>
                                    : '—'}
                                </td>
                                <td className="py-2.5 text-right">
                                  {d && (d.status === 'presentado' || d.status === 'aprobado' || d.status === 'observado' || d.status === 'vencido') && (
                                    <button
                                      onClick={() => { setReviewModal({ doc: d }); setReviewForm({ status: d.status, notes: d.notes ?? '' }); }}
                                      className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors ${
                                        d.status === 'presentado'
                                          ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                                          : 'text-slate-400 border-slate-200 hover:text-slate-600'
                                      }`}
                                    >
                                      {d.status === 'presentado' ? 'Revisar' : 'Editar'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Optional docs and extras */}
                    {(templates.filter(t => !t.required).length > 0 || docs.filter(d => !templates.some(t => t.type === d.type)).length > 0) && (
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Opcionales y adicionales</p>
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-slate-50">
                            {[
                              ...templates.filter(t => !t.required),
                              ...docs.filter(d => !templates.some(t => t.type === d.type))
                                .map(d => ({ type: d.type, label: d.type, required: false })),
                            ].map(template => {
                              const d = docsByType[template.type];
                              const status: DocumentStatus = d?.status ?? 'pendiente';
                              return (
                                <tr key={template.type} className="hover:bg-slate-50">
                                  <td className="py-2.5 pr-4">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                      <span className="text-slate-600 text-sm">{template.label}</span>
                                      {d?.fileUrl && (
                                        <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-amber-500 hover:text-amber-600">
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2.5 pr-4">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CONFIG[status].color}`}>
                                      {STATUS_CONFIG[status].label}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-right">
                                    {d && d.status !== 'pendiente' && (
                                      <button
                                        onClick={() => { setReviewModal({ doc: d }); setReviewForm({ status: d.status, notes: d.notes ?? '' }); }}
                                        className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg"
                                      >
                                        {d.status === 'presentado' ? 'Revisar' : 'Editar'}
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
            <p className="text-sm text-slate-600 mb-4 font-medium">{reviewModal.doc.type}</p>
            {reviewModal.doc.fileUrl && (
              <a href={reviewModal.doc.fileUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 mb-4">
                <ExternalLink className="w-4 h-4" /> Ver documento adjunto
              </a>
            )}
            <div className="mb-3">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Nuevo estado</label>
              <select className={inputCls} value={reviewForm.status}
                onChange={e => setReviewForm(f => ({ ...f, status: e.target.value as DocumentStatus }))}>
                <option value="aprobado">Aprobado</option>
                <option value="observado">Observado</option>
                <option value="vencido">Vencido</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 block">Nota (visible al comercio)</label>
              <textarea rows={3} className={inputCls} placeholder="Ej: Falta firma del titular."
                value={reviewForm.notes} onChange={e => setReviewForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setReviewModal(null)} className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2">Cancelar</button>
              <button onClick={handleReview} disabled={saving}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-bold rounded-xl text-sm">
                {saving ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
