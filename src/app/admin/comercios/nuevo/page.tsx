'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import CommerceForm from '@/components/ui/CommerceForm';
import { createCommerce } from '@/lib/commerceService';
import { Commerce } from '@/types';

type FormData = Omit<Commerce, 'id' | 'slug' | 'tenantId' | 'createdAt' | 'updatedAt'>;

export default function NuevoComercioPage() {
  const router = useRouter();

  async function handleSubmit(data: FormData, ownerEmail?: string) {
    // 1. Crear el comercio en Firestore
    const commerceId = await createCommerce(data);

    // 2. Si hay email, enviar onboarding y crear acceso
    if (ownerEmail) {
      const toastId = toast.loading('Creando acceso y enviando email...');
      try {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: ownerEmail,
            commerceId,
            commerceName: data.name,
          }),
        });

        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error ?? 'Error al enviar el email.');
        }

        toast.success(`Comercio creado. Email de bienvenida enviado a ${ownerEmail}.`, { id: toastId });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        toast.error(`Comercio creado, pero el email falló: ${msg}`, { id: toastId });
      }
    } else {
      toast.success('Comercio creado correctamente.');
    }

    router.push('/admin/comercios');
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/comercios"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Comercios
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-900">Nuevo comercio</span>
      </div>
      <h1 className="text-xl font-bold text-slate-900 mb-6">Agregar comercio</h1>
      <CommerceForm
        onSubmit={handleSubmit}
        submitLabel="Crear comercio"
        showOwnerEmail
      />
    </div>
  );
}
