'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getCommerceById } from '@/lib/commerceService';
import { Commerce } from '@/types';
import Link from 'next/link';
import {
  Store, Bell, FileText, MessageSquare, ArrowRight,
  CheckCircle, AlertTriangle, ExternalLink,
} from 'lucide-react';

const STATUS_CONFIG = {
  no_publicado: { label: 'No publicada', color: 'text-red-600 bg-red-50', alert: true },
  publicado: { label: 'Publicada', color: 'text-emerald-600 bg-emerald-50', alert: false },
  verificado: { label: 'Verificada', color: 'text-emerald-600 bg-emerald-50', alert: false },
  protegido: { label: 'Protegida', color: 'text-blue-600 bg-blue-50', alert: false },
  destacado: { label: 'Destacada', color: 'text-amber-600 bg-amber-50', alert: false },
};

const DOC_CONFIG = {
  pendiente: { label: 'Pendiente', color: 'text-red-600 bg-red-50', alert: true },
  parcial: { label: 'Parcial', color: 'text-amber-600 bg-amber-50', alert: true },
  completa: { label: 'Completa', color: 'text-emerald-600 bg-emerald-50', alert: false },
};

const quickActions = [
  { label: 'Editar mi ficha', href: '/comercio/ficha', icon: Store, desc: 'Actualizar info pública' },
  { label: 'Nueva promoción', href: '/comercio/promociones', icon: Bell, desc: 'Crear oferta o descuento' },
  { label: 'Ver comunicados', href: '/comercio/comunicados', icon: MessageSquare, desc: 'Mensajes del mall' },
  { label: 'Subir documentos', href: '/comercio/documentacion', icon: FileText, desc: 'Legajo digital' },
];

export default function ComercioDashboardPage() {
  const { usuario } = useAuth();
  const [commerce, setCommerce] = useState<Commerce | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario?.commerceId) { setLoading(false); return; }
    getCommerceById(usuario.commerceId)
      .then(setCommerce)
      .finally(() => setLoading(false));
  }, [usuario?.commerceId]);

  const statusConf = commerce ? STATUS_CONFIG[commerce.publicStatus] : null;
  const docConf = commerce ? DOC_CONFIG[commerce.documentationStatus] : null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Hola, {usuario?.displayName?.split(' ')[0] ?? 'Bienvenido'}
        </h1>
        {commerce && (
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            {commerce.name}
            <span className="text-slate-300">·</span>
            Local {commerce.locationCode ?? 'sin asignar'}
          </p>
        )}
      </div>

      {/* Sin comercio vinculado */}
      {!loading && !commerce && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4 mb-8">
          <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-semibold text-slate-900 mb-1">Tu local no está vinculado aún</h2>
            <p className="text-sm text-slate-600">
              Contactá a la administración de HOMA Mall para que te asignen tu comercio.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      {(loading || commerce) && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {/* Estado ficha */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs text-slate-500 mb-1.5">Estado de ficha</p>
            {loading ? (
              <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
            ) : statusConf ? (
              <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${statusConf.color}`}>
                {statusConf.label}
              </span>
            ) : null}
          </div>

          {/* Documentación */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs text-slate-500 mb-1.5">Documentación</p>
            {loading ? (
              <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
            ) : docConf ? (
              <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${docConf.color}`}>
                {docConf.label}
              </span>
            ) : null}
          </div>

          {/* Ver ficha pública */}
          {commerce && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between col-span-2 lg:col-span-1">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Ficha pública</p>
                <p className="text-sm font-semibold text-slate-900 truncate max-w-[140px]">
                  {commerce.name}
                </p>
              </div>
              <Link
                href={`/locales/${commerce.slug}`}
                target="_blank"
                className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accesos rápidos */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Accesos rápidos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map(({ label, href, icon: Icon, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-all group"
              >
                <div className="w-10 h-10 bg-slate-100 group-hover:bg-amber-100 rounded-xl flex items-center justify-center transition-colors shrink-0">
                  <Icon className="w-5 h-5 text-slate-600 group-hover:text-amber-600" />
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 text-sm">{label}</div>
                  <div className="text-xs text-slate-400 truncate">{desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 ml-auto shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Alertas reales */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Estado</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : commerce ? (
            <div className="space-y-3">
              {statusConf?.alert && (
                <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-700">Ficha no publicada</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      Tu local no es visible en el sitio. Contactá a la administración.
                    </p>
                  </div>
                </div>
              )}
              {docConf?.alert && (
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-700">Documentación incompleta</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Subí los documentos pendientes para regularizar tu situación.
                    </p>
                  </div>
                </div>
              )}
              {!statusConf?.alert && !docConf?.alert && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <p className="text-sm font-medium text-emerald-700">Todo en orden</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Sin datos disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
}
