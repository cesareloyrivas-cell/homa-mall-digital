'use client';

import { useEffect, useMemo, useState } from 'react';
import { Coverage } from '@/types';
import { getAllCoverages, updateCoverage, isCoverageExpiringSoon, getCoverageSemaphore } from '@/lib/coverageService';
import { getCommerces } from '@/lib/commerceService';
import { useAuth } from '@/context/AuthContext';
import { Commerce } from '@/types';
import toast from 'react-hot-toast';
import {
  ShieldPlus, ChevronDown, ChevronUp, CheckCircle,
  AlertTriangle, Clock, ExternalLink, Loader2, Circle,
} from 'lucide-react';

const STATUS_CONFIG: Record<Coverage['status'], { label: string; color: string }> = {
  informada: { label: 'Informada', color: 'bg-blue-100 text-blue-700' },
  revisada: { label: 'Aprobada', color: 'bg-emerald-100 text-emerald-700' },
  vencida: { label: 'Vencida', color: 'bg-red-100 text-red-700' },
  pendiente: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700' },
};

const SEMAPHORE_COLORS = {
  verde: 'bg-emerald-400',
  amarillo: 'bg-amber-400',
  rojo: 'bg-red-400',
};

export default function AdminCoberturasPage() {
  const { usuario } = useAuth();
  const [coverages, setCoverages] = useState<Coverage[]>([]);
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<Record<string, string>>({});

  async function load() {
    try {
      const [covs, cms] = await Promise.all([getAllCoverages(), getCommerces()]);
      setCoverages(covs);
      setCommerces(cms);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Group coverages by commerceId
  const byCommerce = useMemo(() => {
    const map: Record<string, Coverage[]> = {};
    coverages.forEach((c) => {
      if (!map[c.commerceId]) map[c.commerceId] = [];
      map[c.commerceId].push(c);
    });
    return map;
  }, [coverages]);

  const commerceMap = useMemo(() => {
    const m: Record<string, Commerce> = {};
    commerces.forEach((c) => { m[c.id] = c; });
    return m;
  }, [commerces]);

  // Commerces that have at least one coverage
  const commercesWithCoverages = useMemo(() =>
    commerces.filter((c) => byCommerce[c.id]?.length > 0),
    [commerces, byCommerce]
  );

  // Summary
  const semaphoreCount = useMemo(() => {
    const counts = { verde: 0, amarillo: 0, rojo: 0 };
    commerces.forEach((c) => {
      const covs = byCommerce[c.id] ?? [];
      const sem = getCoverageSemaphore(covs);
      counts[sem]++;
    });
    return counts;
  }, [commerces, byCommerce]);

  async function handleApprove(covId: string, commerceId: string) {
    setUpdating(covId);
    try {
      await updateCoverage(covId, {
        status: 'revisada',
        reviewedBy: usuario?.displayName ?? usuario?.email ?? 'Admin',
        notes: noteText[covId] || undefined,
      });
      setCoverages((prev) => prev.map((c) => c.id === covId ? { ...c, status: 'revisada', notes: noteText[covId] } : c));
      toast.success('Cobertura aprobada.');
    } catch { toast.error('Error al aprobar.'); }
    finally { setUpdating(null); }
  }

  async function handleMarkExpired(covId: string) {
    setUpdating(covId);
    try {
      await updateCoverage(covId, { status: 'vencida' });
      setCoverages((prev) => prev.map((c) => c.id === covId ? { ...c, status: 'vencida' } : c));
      toast.success('Marcada como vencida.');
    } catch { toast.error('Error al actualizar.'); }
    finally { setUpdating(null); }
  }

  async function saveNote(covId: string) {
    if (!noteText[covId]?.trim()) return;
    setUpdating(covId);
    try {
      await updateCoverage(covId, { notes: noteText[covId].trim() });
      setCoverages((prev) => prev.map((c) => c.id === covId ? { ...c, notes: noteText[covId].trim() } : c));
      toast.success('Nota guardada.');
    } catch { toast.error('Error al guardar la nota.'); }
    finally { setUpdating(null); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldPlus className="w-5 h-5 text-blue-500" /> Coberturas y Protección
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Revisá y aprobá las pólizas informadas por los comercios.</p>
      </div>

      {/* Semaphore summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { key: 'verde', label: 'Al día', icon: CheckCircle, textColor: 'text-emerald-700' },
          { key: 'amarillo', label: 'Por vencer', icon: Clock, textColor: 'text-amber-700' },
          { key: 'rojo', label: 'Crítico', icon: AlertTriangle, textColor: 'text-red-700' },
        ].map(({ key, label, icon: Icon, textColor }) => (
          <div key={key} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${SEMAPHORE_COLORS[key as keyof typeof SEMAPHORE_COLORS]}`} />
            <div>
              <div className={`text-2xl font-bold ${textColor}`}>
                {semaphoreCount[key as keyof typeof semaphoreCount]}
              </div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Commerce accordion list */}
      {commercesWithCoverages.length === 0 ? (
        <div className="text-center py-16">
          <ShieldPlus className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Ningún comercio ha informado coberturas aún.</p>
          <p className="text-sm text-slate-400 mt-1">Las coberturas aparecerán aquí cuando los propietarios las carguen.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {commercesWithCoverages.map((commerce) => {
            const covs = byCommerce[commerce.id] ?? [];
            const sem = getCoverageSemaphore(covs);
            const isExp = expanded === commerce.id;

            return (
              <div key={commerce.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Commerce header */}
                <button
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => setExpanded(isExp ? null : commerce.id)}
                >
                  <div className={`w-3 h-3 rounded-full shrink-0 ${SEMAPHORE_COLORS[sem]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 text-sm">{commerce.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {covs.length} cobertura{covs.length !== 1 ? 's' : ''} ·{' '}
                      {covs.filter((c) => c.status === 'informada').length} pendiente{covs.filter((c) => c.status === 'informada').length !== 1 ? 's' : ''} de revisión
                    </div>
                  </div>
                  {isExp ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {/* Coverage rows */}
                {isExp && (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {covs.map((cov) => {
                      const cfg = STATUS_CONFIG[cov.status];
                      const expiring = cov.status !== 'vencida' && isCoverageExpiringSoon(cov.expiresAt);
                      return (
                        <div key={cov.id} className="p-5 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-slate-900 text-sm">{cov.type}</span>
                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                                {expiring && (
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Vence pronto
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {cov.insurer}
                                {cov.policyNumber && <> · Póliza {cov.policyNumber}</>}
                                {' · '}
                                {new Date(cov.startsAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {' → '}
                                <span className={cov.status === 'vencida' ? 'text-red-600 font-semibold' : ''}>
                                  {new Date(cov.expiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {cov.fileUrl && (
                                <a href={cov.fileUrl} target="_blank" rel="noopener noreferrer"
                                  className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                  <ExternalLink className="w-3.5 h-3.5" /> Ver póliza
                                </a>
                              )}
                            </div>
                          </div>

                          {/* Note input */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Nota para el comercio (opcional)"
                              defaultValue={cov.notes ?? ''}
                              onChange={(e) => setNoteText((p) => ({ ...p, [cov.id]: e.target.value }))}
                              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                          </div>

                          {/* Actions */}
                          {cov.status === 'informada' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(cov.id, commerce.id)}
                                disabled={updating === cov.id}
                                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs rounded-xl disabled:opacity-50"
                              >
                                {updating === cov.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                Aprobar
                              </button>
                              <button
                                onClick={() => handleMarkExpired(cov.id)}
                                disabled={updating === cov.id}
                                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs rounded-xl border border-red-200 disabled:opacity-50"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" /> Marcar vencida
                              </button>
                              {noteText[cov.id]?.trim() && (
                                <button
                                  onClick={() => saveNote(cov.id)}
                                  disabled={updating === cov.id}
                                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
                                >
                                  Guardar nota
                                </button>
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
          })}
        </div>
      )}
    </div>
  );
}
