'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getDocumentsByCommerce, uploadDocumentFile, createDocument, updateDocument,
  isExpiringSoon, DOCUMENT_TYPES,
} from '@/lib/documentService';
import { CommercDocument, DocumentStatus } from '@/types';
import {
  FileText, Upload, ExternalLink, AlertTriangle, CheckCircle,
  Clock, XCircle, Eye, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; icon: typeof Clock }> = {
  pendiente: { label: 'Requerido', color: 'text-slate-600 bg-slate-100', icon: Clock },
  presentado: { label: 'En revisión', color: 'text-blue-700 bg-blue-100', icon: Eye },
  observado: { label: 'Observado', color: 'text-amber-700 bg-amber-100', icon: AlertTriangle },
  aprobado: { label: 'Aprobado', color: 'text-emerald-700 bg-emerald-100', icon: CheckCircle },
  vencido: { label: 'Vencido', color: 'text-red-700 bg-red-100', icon: XCircle },
};

const MAX_FILE_MB = 10;
const MAX_BYTES = MAX_FILE_MB * 1024 * 1024;

export default function ComercioDocumentacionPage() {
  const { usuario } = useAuth();
  const [docs, setDocs] = useState<CommercDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingUpload, setPendingUpload] = useState<{ docId?: string; type: string } | null>(null);

  const commerceId = usuario?.commerceId ?? '';

  async function load() {
    if (!commerceId) { setLoading(false); return; }
    setLoading(true);
    try {
      setDocs(await getDocumentsByCommerce(commerceId));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [commerceId]);

  function handleUploadClick(docId?: string, type?: string) {
    setPendingUpload({ docId, type: type ?? DOCUMENT_TYPES[0] });
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !pendingUpload || !usuario || !commerceId) return;

    if (file.size > MAX_BYTES) {
      toast.error(`El archivo supera los ${MAX_FILE_MB} MB.`);
      return;
    }

    setUploading(pendingUpload.docId ?? pendingUpload.type);
    try {
      const url = await uploadDocumentFile(commerceId, pendingUpload.type, file);

      if (pendingUpload.docId) {
        await updateDocument(pendingUpload.docId, {
          fileUrl: url,
          status: 'presentado',
          notes: undefined,
        });
      } else {
        await createDocument({
          commerceId,
          type: pendingUpload.type,
          fileUrl: url,
          status: 'presentado',
          uploadedBy: usuario.uid,
        });
      }

      toast.success('Documento enviado. El equipo de HOMA Mall lo revisará pronto.');
      load();
    } catch (err) {
      toast.error('No se pudo subir el archivo.');
    } finally {
      setUploading(null);
      setPendingUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Build display list: one entry per doc type (uploaded or not)
  const docsByType = Object.fromEntries(docs.map(d => [d.type, d]));
  const allTypes = [
    ...DOCUMENT_TYPES.filter(t => docsByType[t]),
    ...DOCUMENT_TYPES.filter(t => !docsByType[t]),
    ...docs.filter(d => !DOCUMENT_TYPES.includes(d.type)).map(d => d.type),
  ];
  const uniqueTypes = [...new Set(allTypes)];

  const pendingCount = docs.filter(d => d.status === 'pendiente').length;
  const observadoCount = docs.filter(d => d.status === 'observado').length;

  if (!commerceId) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Tu local no está vinculado. Contactá a la administración.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Legajo documental</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pendingCount > 0 && <span className="text-red-600 font-medium">{pendingCount} pendiente{pendingCount > 1 ? 's' : ''} · </span>}
            {observadoCount > 0 && <span className="text-amber-600 font-medium">{observadoCount} observado{observadoCount > 1 ? 's' : ''} · </span>}
            Documentación requerida por la administración del mall
          </p>
        </div>
        <button onClick={load} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Alert banners */}
      {(pendingCount > 0 || observadoCount > 0) && (
        <div className="mb-5 space-y-2">
          {pendingCount > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <XCircle className="w-4 h-4 shrink-0" />
              Tenés {pendingCount} documento{pendingCount > 1 ? 's' : ''} pendiente{pendingCount > 1 ? 's' : ''} de presentar.
            </div>
          )}
          {observadoCount > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {observadoCount} documento{observadoCount > 1 ? 's' : ''} fue{observadoCount > 1 ? 'ron' : ''} observado{observadoCount > 1 ? 's' : ''} y requier{observadoCount > 1 ? 'en' : 'e'} corrección.
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Sin requisitos documentales asignados.</p>
          <p className="text-slate-400 text-sm mt-1">La administración del mall te indicará los documentos necesarios.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map(d => {
            const conf = STATUS_CONFIG[d.status];
            const Icon = conf.icon;
            const isUploading = uploading === d.id;
            const canUpload = d.status === 'pendiente' || d.status === 'observado' || d.status === 'vencido';
            const expiringSoon = isExpiringSoon(d.expiresAt);

            return (
              <div
                key={d.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 ${
                  d.status === 'observado' ? 'border-amber-200' :
                  d.status === 'pendiente' || d.status === 'vencido' ? 'border-red-200' :
                  'border-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`mt-0.5 p-2 rounded-lg ${
                      d.status === 'aprobado' ? 'bg-emerald-50' :
                      d.status === 'observado' ? 'bg-amber-50' :
                      d.status === 'pendiente' || d.status === 'vencido' ? 'bg-red-50' :
                      'bg-slate-50'
                    }`}>
                      <FileText className={`w-4 h-4 ${
                        d.status === 'aprobado' ? 'text-emerald-600' :
                        d.status === 'observado' ? 'text-amber-600' :
                        d.status === 'pendiente' || d.status === 'vencido' ? 'text-red-600' :
                        'text-slate-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-slate-900">{d.type}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${conf.color}`}>
                          <Icon className="w-3 h-3" /> {conf.label}
                        </span>
                        {expiringSoon && (
                          <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Próximo a vencer
                          </span>
                        )}
                      </div>

                      {d.expiresAt && (
                        <p className="text-xs text-slate-400">
                          Vence: {new Date(d.expiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}

                      {d.notes && (
                        <div className={`mt-2 text-xs rounded-lg px-3 py-2 ${
                          d.status === 'observado' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-50 text-slate-600'
                        }`}>
                          {d.status === 'observado' && <span className="font-semibold block mb-0.5">Observación:</span>}
                          {d.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {d.fileUrl && (
                      <a
                        href={d.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 border border-slate-200 hover:border-amber-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Ver archivo
                      </a>
                    )}
                    {canUpload && (
                      <button
                        onClick={() => handleUploadClick(d.id, d.type)}
                        disabled={!!uploading}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {isUploading ? 'Subiendo...' : d.fileUrl ? 'Reenviar' : 'Subir'}
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
