'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, UserCheck, Unlink, Link2, Copy, Check, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import CommerceForm from '@/components/ui/CommerceForm';
import { getCommerceById, updateCommerce } from '@/lib/commerceService';
import { getUserById, linkUserToCommerce, unlinkUserFromCommerce } from '@/lib/userService';
import { Commerce, AppUser } from '@/types';

export default function EditarComercioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [commerce, setCommerce] = useState<Commerce | null>(null);
  const [loading, setLoading] = useState(true);

  // Vinculación
  const [ownerUid, setOwnerUid] = useState('');
  const [linkedUser, setLinkedUser] = useState<AppUser | null>(null);
  const [linking, setLinking] = useState(false);

  // Acceso rápido
  const [accessEmail, setAccessEmail] = useState('');
  const [generatingLink, setGeneratingLink] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getCommerceById(id)
      .then(setCommerce)
      .catch(() => toast.error('No se pudo cargar el comercio.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(data: Omit<Commerce, 'id' | 'slug' | 'tenantId' | 'createdAt' | 'updatedAt'>) {
    await updateCommerce(id, data);
    toast.success('Cambios guardados.');
    router.push('/admin/comercios');
  }

  async function handleLookupUser() {
    if (!ownerUid.trim()) return;
    setLinking(true);
    try {
      const user = await getUserById(ownerUid.trim());
      if (!user) toast.error('No se encontró ningún usuario con ese UID.');
      else setLinkedUser(user);
    } catch { toast.error('Error al buscar el usuario.'); }
    finally { setLinking(false); }
  }

  async function handleLink() {
    if (!linkedUser) return;
    setLinking(true);
    try {
      await linkUserToCommerce(linkedUser.uid, id);
      toast.success('Usuario vinculado a este comercio.');
    } catch { toast.error('No se pudo vincular el usuario.'); }
    finally { setLinking(false); }
  }

  async function handleUnlink() {
    if (!linkedUser) return;
    setLinking(true);
    try {
      await unlinkUserFromCommerce(linkedUser.uid);
      setLinkedUser(null);
      setOwnerUid('');
      toast.success('Vínculo eliminado.');
    } catch { toast.error('No se pudo desvincular.'); }
    finally { setLinking(false); }
  }

  async function handleGenerateLink() {
    if (!accessEmail.trim()) return;
    setGeneratingLink(true);
    setResetLink(null);
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: accessEmail.trim(),
          role: 'propietario_comercio',
          commerceId: id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResetLink(data.resetLink);
      toast.success('Usuario creado y listo para activar.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al generar acceso.');
    } finally {
      setGeneratingLink(false);
    }
  }

  async function copyLink() {
    if (!resetLink) return;
    await navigator.clipboard.writeText(resetLink);
    setCopied(true);
    toast.success('Link copiado.');
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!commerce) {
    return (
      <div className="p-6 text-center text-slate-500">
        Comercio no encontrado. <Link href="/admin/comercios" className="text-amber-600 font-medium">Volver</Link>
      </div>
    );
  }

  const initial = {
    name: commerce.name, legalName: commerce.legalName, cuit: commerce.cuit,
    category: commerce.category, subcategory: commerce.subcategory,
    locationCode: commerce.locationCode, description: commerce.description,
    whatsapp: commerce.whatsapp, instagram: commerce.instagram,
    email: commerce.email, phone: commerce.phone, schedule: commerce.schedule,
    publicStatus: commerce.publicStatus, internalStatus: commerce.internalStatus,
    documentationStatus: commerce.documentationStatus,
    protectionStatus: commerce.protectionStatus, isFeatured: commerce.isFeatured,
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/comercios" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Comercios
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{commerce.name}</span>
        </div>
        <Link href={`/locales/${commerce.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-amber-600 transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> Ver ficha pública
        </Link>
      </div>

      <h1 className="text-xl font-bold text-slate-900 mb-6">Editar: {commerce.name}</h1>

      <CommerceForm initial={initial} onSubmit={handleSubmit} submitLabel="Guardar cambios" />

      {/* Acceso del propietario — flujo rápido */}
      <div className="mt-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-slate-500" />
          Generar acceso al propietario
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Ingresá el email del propietario. El sistema crea el usuario (si no existe) y genera un link para que pueda crear su contraseña. Compartíselo directamente.
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="email"
            placeholder="email@propietario.com"
            value={accessEmail}
            onChange={e => setAccessEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerateLink()}
            className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <button
            onClick={handleGenerateLink}
            disabled={generatingLink || !accessEmail.trim()}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold text-sm rounded-xl disabled:opacity-50 transition-colors inline-flex items-center gap-2"
          >
            {generatingLink ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
            {generatingLink ? 'Generando...' : 'Generar link'}
          </button>
        </div>

        {resetLink && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-emerald-700 mb-2">Link generado · Válido 24 horas</p>
            <div className="bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 break-all mb-3 select-all">
              {resetLink}
            </div>
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Copiado!' : 'Copiar link'}
            </button>
          </div>
        )}
      </div>

      {/* Vinculación por UID */}
      <div className="mt-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-slate-500" />
          Vincular usuario existente por UID
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Usá esto si el usuario ya existe en Firebase y querés asignarlo a este comercio.
        </p>

        {linkedUser ? (
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-slate-900">{linkedUser.email || '(sin email)'}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{linkedUser.uid}</p>
              <p className="text-xs text-emerald-700 mt-1">Rol: {linkedUser.role} · Comercio: {linkedUser.commerceId ?? 'sin asignar'}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handleLink} disabled={linking} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs rounded-xl disabled:opacity-60">
                {linking ? '...' : 'Confirmar vínculo'}
              </button>
              <button onClick={handleUnlink} disabled={linking} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl">
                <Unlink className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="UID del usuario (ej: abc123XYZ...)"
              value={ownerUid}
              onChange={e => setOwnerUid(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLookupUser()}
              className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button onClick={handleLookupUser} disabled={linking || !ownerUid.trim()} className="px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white font-semibold text-sm rounded-xl disabled:opacity-50">
              {linking ? '...' : 'Buscar'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
