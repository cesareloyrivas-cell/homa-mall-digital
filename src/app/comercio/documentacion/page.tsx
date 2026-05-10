'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCommerce } from '@/hooks/useCommerce';
import {
  getDocumentsByCommerce, uploadDocumentFile, createDocument, updateDocument,
  isExpiringSoon, getDocumentTypesForCategory,
} from '@/lib/documentService';
import { CommercDocument, DocumentStatus } from '@/types';
import {
  FileText, Upload, ExternalLink, AlertTriangle, CheckCircle,
  Clock, XCircle, Eye, RefreshCw, Info,
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
  const { commerce } = useCommerce();
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
    setPendingUpload({ docId, type: type ?? '' });
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

      toast.success('Documento enviado. El equipo de Mall Digital lo revisará pronto.');
      load();
    } catch {
      toast.error('No se pudo subir el archivo.');
    } finally {
      setUploading(null);
      setPendingUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  // Build template list from commerce category
  const templateTypes = commerce
    ? getDocumentTypesForCategory(commerce.category)
    : ['Habilitación municipal', 'Inscripción impositiva (AFIP)', 'Contrato de locación', 'Certificado de bomberos', 'Otro'];

  const docsByType: Record<string, CommercDocument> = Object.fromEntries(docs.map((d) => [d.type, d]));

  // Merge: template types first, then any extra docs uploaded outside the template
  const extraDocs = docs.filter((d) => !templateTypes.includes(d.type));
  const allDisplayTypes = [...templateTypes, ...extraDocs.map((d) => d.type)];
  const uniqueTypes = [...new Set(allDisplayTypes)];

  const pendingCount = uniqueTypes.filter((t) => {
    const d = docsByType[t];
    return !d || d.status === 'pendiente';
  }).length;
  const observadoCount = docs.filter((d) => d.status === 'observado').length;
  const approvedCount = docs.filter((d) => d.status === 'aprobado').length;

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
            Documentación requerida para operar en Mall Digital
            {commerce && <> · {commerce.category}</>}
          </p>
        </div>
        <button onClick={load} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress summary */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-emerald-700">{approvedCount}</div>
            <div className="text-xs text-emerald-600 font-medium">Aprobados</div>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{observadoCount}</div>
            <div className="text-xs text-amber-600 font-medium">Observados</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-slate-700">{pendingCount}</div>
            <div className="text-xs text-slate-500 font-medium">Pendientes</div>
          </div>
        </div>
      )}

      {/* Alert banners */}
      {!loading && (pendingCount > 0 || observadoCount > 0) && (
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

      {/* Info banner: category-specific */}
      {commerce && !loading && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 mb-5">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            El listado de documentos está personalizado para comercios de <strong>{commerce.category}</strong>.
            Si necesitás agregar un documento adicional, consultá a la administración del mall.
          </span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {uniqueTypes.map((type) => {
            const d = docsByType[type];
            const status: DocumentStatus = d?.status ?? 'pendiente';
            const conf = STATUS_CONFIG[status];
            const Icon = conf.icon;
            const isUploading = uploading === (d?.id ?? type);
            const canUpload = status === 'pendiente' || status === 'observado' || status === 'vencido';
            const expiringSoon = isExpiringSoon(d?.expiresAt);
            const isTemplate = templateTypes.includes(type);

            return (
              <div
                key={type}
                className={`bg-white rounded-2xl border shadow-sm p-5 ${
                  status === 'observado' ? 'border-amber-200' :
                  status === 'pendiente' || status === 'vencido' ? 'border-slate-200' :
                  status === 'aprobado' ? 'border-emerald-100' :
                  'border-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${
                      status === 'aprobado' ? 'bg-emerald-50' :
                      status === 'observado' ? 'bg-amber-50' :
                      status === 'vencido' ? 'bg-red-50' :
                      status === 'presentado' ? 'bg-blue-50' :
                      'bg-slate-50'
                    }`}>
                      <FileText className={`w-4 h-4 ${
                        status === 'aprobado' ? 'text-emerald-600' :
                        status === 'observado' ? 'text-amber-600' :
                        status === 'vencido' ? 'text-red-600' :
                        status === 'presentado' ? 'text-blue-600' :
                        'text-slate-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-slate-900 text-sm">{type}</span>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${conf.color}`}>
                          <Icon className="w-3 h-3" /> {conf.label}
                        </span>
                        {!isTemplate && (
                          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Extra</span>
                        )}
                        {expiringSoon && (
                          <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Próximo a vencer
                          </span>
                        )}
                      </div>

                      {d?.expiresAt && (
                        <p className="text-xs text-slate-400">
                          Vence: {new Date(d.expiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      )}

                      {d?.notes && (
                        <div className={`mt-2 text-xs rounded-lg px-3 py-2 ${
                          status === 'observado'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-50 text-slate-600'
                        }`}>
                          {status === 'observado' && <span className="font-semibold block mb-0.5">Observación del mall:</span>}
                          {d.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {d?.fileUrl && (
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
                        onClick={() => handleUploadClick(d?.id, type)}
                        disabled={!!uploading}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {isUploading ? 'Subiendo...' : d?.fileUrl ? 'Reenviar' : 'Subir'}
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
