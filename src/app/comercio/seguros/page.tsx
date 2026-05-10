'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Coverage } from '@/types';
import {
  getCoveragesByCommerce, createCoverage, updateCoverage,
  uploadCoverageFile, COVERAGE_TYPES, isCoverageExpiringSoon,
} from '@/lib/coverageService';
import toast from 'react-hot-toast';
import {
  ShieldCheck, Plus, X, ExternalLink, Upload, Loader2,
  AlertTriangle, CheckCircle, Clock, FileText,
} from 'lucide-react';

const STATUS_CONFIG: Record<Coverage['status'], { label: string; color: string; icon: typeof CheckCircle }> = {
  informada: { label: 'Informada', color: 'bg-blue-100 text-blue-700', icon: FileText },
  revisada: { label: 'Aprobada', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  vencida: { label: 'Vencida', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  pendiente: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', icon: Clock },
};

export default function ComercioSegurosPage() {
  const { usuario } = useAuth();
  const [coverages, setCoverages] = useState<Coverage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [type, setType] = useState(COVERAGE_TYPES[0]);
  const [insurer, setInsurer] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const commerceId = usuario?.commerceId ?? '';

  async function load() {
    if (!commerceId) { setLoading(false); return; }
    try {
      const data = await getCoveragesByCommerce(commerceId);
      setCoverages(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [commerceId]);

  function resetForm() {
    setType(COVERAGE_TYPES[0]); setInsurer(''); setPolicyNumber('');
    setStartsAt(''); setExpiresAt(''); setFile(null); setShowForm(false);
  }

  async function handleSubmit() {
    if (!insurer.trim() || !startsAt || !expiresAt || !usuario) return;
    setSubmitting(true);
    try {
      let fileUrl: string | undefined;
      if (file) {
        fileUrl = await uploadCoverageFile(commerceId, type, file);
      }
      const id = await createCoverage({
        commerceId,
        type,
        insurer: insurer.trim(),
        policyNumber: policyNumber.trim() || undefined,
        startsAt,
        expiresAt,
        fileUrl,
        status: 'informada',
        notes: undefined,
        reviewedBy: undefined,
      });
      setCoverages((prev) => [{
        id, tenantId: 'homa_mall', commerceId, type, insurer: insurer.trim(),
        policyNumber: policyNumber.trim() || undefined, startsAt, expiresAt,
        fileUrl, status: 'informada',
      }, ...prev]);
      resetForm();
      toast.success('Cobertura informada correctamente.');
    } catch {
      toast.error('Error al guardar la cobertura.');
    } finally {
      setSubmitting(false);
    }
  }

  const expiringSoon = coverages.filter(
    (c) => c.status !== 'vencida' && isCoverageExpiringSoon(c.expiresAt)
  );
  const expired = coverages.filter((c) => c.status === 'vencida');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" /> Coberturas y Protección
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Informá las pólizas vigentes de tu comercio.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Agregar cobertura
          </button>
        )}
      </div>

      {/* Alerts */}
      {expired.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {expired.length} cobertura{expired.length > 1 ? 's' : ''} vencida{expired.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {expired.map((c) => c.type).join(', ')}. Actualizá las pólizas para mantener tu protección.
            </p>
          </div>
        </div>
      )}
      {expiringSoon.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700">
              {expiringSoon.length} cobertura{expiringSoon.length > 1 ? 's vencen' : ' vence'} pronto
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {expiringSoon.map((c) => c.type).join(', ')}. Renovalas antes de que venzan.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Nueva cobertura</h2>
            <button onClick={resetForm} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Tipo de cobertura *</label>
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                  {COVERAGE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Aseguradora *</label>
                <input type="text" placeholder="Ej: Zurich, Sancor, San Cristóbal..." value={insurer}
                  onChange={(e) => setInsurer(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">N° de póliza</label>
                <input type="text" placeholder="Opcional" value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vigencia desde *</label>
                <input type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vence *</label>
                <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Póliza (PDF o imagen)</label>
              <input ref={fileRef} type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="hidden" />
              <button onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-slate-300 hover:border-amber-400 rounded-xl text-sm text-slate-500 hover:text-slate-700 transition-colors">
                <Upload className="w-4 h-4" />
                {file ? file.name : 'Adjuntar archivo (opcional)'}
              </button>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSubmit} disabled={submitting || !insurer.trim() || !startsAt || !expiresAt}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm rounded-xl disabled:opacity-50">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : 'Guardar cobertura'}
              </button>
              <button onClick={resetForm}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coverage list */}
      {coverages.length === 0 ? (
        <div className="text-center py-16">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No hay coberturas informadas</p>
          <p className="text-sm text-slate-400 mt-1">Cargá tus pólizas para que el mall las tenga registradas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coverages.map((cov) => {
            const cfg = STATUS_CONFIG[cov.status];
            const expiring = cov.status !== 'vencida' && isCoverageExpiringSoon(cov.expiresAt);
            return (
              <div key={cov.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${
                cov.status === 'vencida' ? 'border-red-200' : expiring ? 'border-amber-200' : 'border-slate-100'
              }`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 text-sm">{cov.type}</h3>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      {expiring && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Vence pronto
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {cov.insurer}
                      {cov.policyNumber && <> · Póliza {cov.policyNumber}</>}
                    </p>
                  </div>
                  {cov.fileUrl && (
                    <a href={cov.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors shrink-0">
                      <ExternalLink className="w-3.5 h-3.5" /> Ver póliza
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Desde {new Date(cov.startsAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>·</span>
                  <span className={cov.status === 'vencida' ? 'text-red-600 font-semibold' : ''}>
                    Vence {new Date(cov.expiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {cov.notes && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800">
                    <span className="font-semibold">Nota del mall:</span> {cov.notes}
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
