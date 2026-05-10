'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { getCommerceById, updateCommerce } from '@/lib/commerceService';
import CommerceOwnerForm from '@/components/ui/CommerceOwnerForm';
import { Commerce } from '@/types';

export default function FichaPage() {
  const { usuario } = useAuth();
  const [commerce, setCommerce] = useState<Commerce | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario?.commerceId) {
      setLoading(false);
      return;
    }
    getCommerceById(usuario.commerceId)
      .then(setCommerce)
      .catch(() => toast.error('No se pudo cargar tu ficha.'))
      .finally(() => setLoading(false));
  }, [usuario?.commerceId]);

  async function handleSubmit(
    data: Pick<Commerce, 'description' | 'whatsapp' | 'instagram' | 'email' | 'phone' | 'schedule'>
  ) {
    if (!commerce) return;
    await updateCommerce(commerce.id, data);
    toast.success('¡Ficha actualizada! Los cambios ya son visibles en el sitio.');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!usuario?.commerceId || !commerce) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-slate-900 mb-1">Tu local no está vinculado aún</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tu usuario todavía no tiene un local asignado. Contactá a la administración de
              Mall Digital para que te vinculen con tu comercio.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const STATUS_LABELS = {
    no_publicado: { label: 'No publicado', color: 'text-red-700 bg-red-100' },
    publicado: { label: 'Publicado', color: 'text-emerald-700 bg-emerald-100' },
    verificado: { label: 'Verificado', color: 'text-emerald-700 bg-emerald-100' },
    protegido: { label: 'Protegido', color: 'text-blue-700 bg-blue-100' },
    destacado: { label: 'Destacado', color: 'text-amber-700 bg-amber-100' },
  };

  const statusInfo = STATUS_LABELS[commerce.publicStatus];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Mi ficha pública</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Los cambios se reflejan en el sitio al instante.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <Link
            href={`/locales/${commerce.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-amber-600 transition-colors border border-slate-200 hover:border-amber-300 px-3 py-1.5 rounded-xl"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ver ficha
          </Link>
        </div>
      </div>

      <CommerceOwnerForm
        initial={{
          description: commerce.description,
          whatsapp: commerce.whatsapp,
          instagram: commerce.instagram,
          email: commerce.email,
          phone: commerce.phone,
          schedule: commerce.schedule,
        }}
        readonlyInfo={{
          name: commerce.name,
          category: commerce.category,
          locationCode: commerce.locationCode,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
