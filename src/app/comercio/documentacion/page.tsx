'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCommerce } from '@/hooks/useCommerce';
import {
  getDocumentsByCommerce, uploadDocumentFile, createDocument, updateDocument,
  isExpiringSoon,
} from '@/lib/documentService';
import { getBusinessModel, MODEL_CONFIGS } from '@/lib/businessModels';
import { getTemplateForModel, DocumentTemplate } from '@/lib/documentTemplates';
import { CommercDocument, DocumentStatus } from '@/types';
import {
  FileText, Upload, ExternalLink, AlertTriangle, CheckCircle,
  Clock, XCircle, Eye, RefreshCw, Info, Star,
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
        await updateDocument(pendingUpload.docId, { fileUrl: url, status: 'presentado', notes: undefined });
      } else {
        await createDocument({
          commerceId, type: pendingUpload.type, fileUrl: url,
          status: 'presentado', uploadedBy: usuario.uid,
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

  // Business model & template
  const businessModel = commerce ? getBusinessModel(commerce.category) : 'general';
  const modelConfig = MODEL_CONFIGS[businessModel];
  const templates = getTemplateForModel(businessModel);
  const docsByType: Record<string, CommercDocument> = Object.fromEntries(docs.map((d) => [d.type, d]));
  const templateTypes = templates.map((t) => t.type);

  // Extra docs uploaded outside template
  const extraDocs = docs.filter((d) => !templateTypes.includes(d.type));

  // Stats
  const requiredTemplates = templates.filter((t) => t.required);
  const approvedCount = requiredTemplates.filter((t) => docsByType[t.type]?.status === 'aprobado').length;
  const observadoCount = docs.filter((d) => d.status === 'observado').length;
  const pendingCount = requiredTemplates.filter((t) => {
    const d = docsByType[t.type];
    return !d || d.status === 'pendiente';
  }).length;
  const progress = requiredTemplates.length > 0
    ? Math.round((approvedCount / requiredTemplates.length) * 100)
    : 0;

  if (!commerceId) {
    return (
      <div className="p-6 text-center text-slate-500 text-sm">
        Tu local no está vinculado. Contactá a la administración.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileChange} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Legajo documental</h1>
          <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
            {commerce && <><span>{modelConfig.emoji}</span><span>{commerce.category}</span></>}
          </p>
        </div>
        <button onClick={load} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      {!loading && requiredTemplates.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">Progreso del legajo</span>
            <span className="text-sm font-bold text-slate-900">{approvedCount}/{requiredTemplates.length} aprobados</span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress === 100 ? 'bg-emerald-500' : progress >= 50 ? 'bg-amber-500' : 'bg-red-400'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{approvedCount} aprobados</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />{observadoCount} observados</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />{pendingCount} pendientes</span>
            </div>
            {progress === 100 && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Legajo completo
              </span>
            )}
          </div>
        </div>
      )}

      {/* Alert banners */}
      {!loading && (pendingCount > 0 || observadoCount > 0) && (
        <div className="mb-5 space-y-2">
          {pendingCount > 0 && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <XCircle className="w-4 h-4 shrink-0" />
              Tenés {pendingCount} documento{pendingCount > 1 ? 's' : ''} obligatorio{pendingCount > 1 ? 's' : ''} sin presentar.
            </div>
          )}
          {observadoCount > 0 && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {observadoCount} documento{observadoCount > 1 ? 's fueron' : ' fue'} observado{observadoCount > 1 ? 's' : ''} y requiere{observadoCount > 1 ? 'n' : ''} corrección.
            </div>
          )}
        </div>
      )}

      {/* Category info */}
      {commerce && !loading && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 mb-5">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Este legajo está personalizado para comercios de <strong>{commerce.category}</strong>.
            Incluye {requiredTemplates.length} documento{requiredTemplates.length !== 1 ? 's' : ''} obligatorio{requiredTemplates.length !== 1 ? 's' : ''} y {templates.length - requiredTemplates.length} opcional{templates.length - requiredTemplates.length !== 1 ? 'es' : ''}.
          </span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Required docs */}
          <div>
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Documentos obligatorios ({requiredTemplates.length})
            </h2>
            <div className="space-y-3">
              {requiredTemplates.map((template) => (
                <DocRow
                  key={template.type}
                  template={template}
                  doc={docsByType[template.type]}
                  uploading={uploading}
                  onUpload={handleUploadClick}
                />
              ))}
            </div>
          </div>

          {/* Optional docs */}
          {templates.filter((t) => !t.required).length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Documentos opcionales
              </h2>
              <div className="space-y-3">
                {templates.filter((t) => !t.required).map((template) => (
                  <DocRow
                    key={template.type}
                    template={template}
                    doc={docsByType[template.type]}
                    uploading={uploading}
                    onUpload={handleUploadClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Extra docs (outside template) */}
          {extraDocs.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Otros documentos</h2>
              <div className="space-y-3">
                {extraDocs.map((doc) => (
                  <DocRow
                    key={doc.id}
                    template={{ type: doc.type, label: doc.type, description: '', required: false, acceptsExpiry: true }}
                    doc={doc}
                    uploading={uploading}
                    onUpload={handleUploadClick}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface DocRowProps {
  template: DocumentTemplate;
  doc?: CommercDocument;
  uploading: string | null;
  onUpload: (docId?: string, type?: string) => void;
}

function DocRow({ template, doc, uploading, onUpload }: DocRowProps) {
  const status: DocumentStatus = doc?.status ?? 'pendiente';
  const conf = STATUS_CONFIG[status];
  const Icon = conf.icon;
  const isUploading = uploading === (doc?.id ?? template.type);
  const canUpload = status === 'pendiente' || status === 'observado' || status === 'vencido';
  const expiringSoon = isExpiringSoon(doc?.expiresAt);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 ${
      status === 'observado' ? 'border-amber-200' :
      status === 'vencido' ? 'border-red-200' :
      status === 'aprobado' ? 'border-emerald-100' :
      'border-slate-100'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`mt-0.5 p-2 rounded-lg shrink-0 ${
            status === 'aprobado' ? 'bg-emerald-50' :
            status === 'observado' ? 'bg-amber-50' :
            status === 'vencido' ? 'bg-red-50' :
            status === 'presentado' ? 'bg-blue-50' : 'bg-slate-50'
          }`}>
            <FileText className={`w-4 h-4 ${
              status === 'aprobado' ? 'text-emerald-600' :
              status === 'observado' ? 'text-amber-600' :
              status === 'vencido' ? 'text-red-600' :
              status === 'presentado' ? 'text-blue-600' : 'text-slate-400'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-slate-900 text-sm">{template.label}</span>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${conf.color}`}>
                <Icon className="w-3 h-3" /> {conf.label}
              </span>
              {!template.required && (
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Opcional</span>
              )}
              {expiringSoon && (
                <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Próximo a vencer
                </span>
              )}
            </div>
            {template.description && (
              <p className="text-xs text-slate-400 mb-1.5">{template.description}</p>
            )}
            {doc?.expiresAt && (
              <p className="text-xs text-slate-400">
                Vence: {new Date(doc.expiresAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
            {doc?.notes && (
              <div className={`mt-2 text-xs rounded-lg px-3 py-2 ${
                status === 'observado'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-slate-50 text-slate-600'
              }`}>
                {status === 'observado' && <span className="font-semibold block mb-0.5">Observación del mall:</span>}
                {doc.notes}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {doc?.fileUrl && (
            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 border border-slate-200 hover:border-amber-300 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink className="w-3.5 h-3.5" /> Ver archivo
            </a>
          )}
          {canUpload && (
            <button onClick={() => onUpload(doc?.id, template.type)} disabled={!!uploading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 px-3 py-1.5 rounded-lg transition-colors">
              <Upload className="w-3.5 h-3.5" />
              {isUploading ? 'Subiendo...' : doc?.fileUrl ? 'Reenviar' : 'Subir'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
