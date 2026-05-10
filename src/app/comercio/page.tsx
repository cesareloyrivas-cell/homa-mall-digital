'use client';

import { useAuth } from '@/context/AuthContext';
import { useCommerce } from '@/hooks/useCommerce';
import Link from 'next/link';
import {
  Store, Bell, FileText, MessageSquare, ArrowRight,
  CheckCircle, AlertTriangle, ExternalLink, ShieldCheck, Ticket,
} from 'lucide-react';
import { getBusinessModel, MODEL_CONFIGS } from '@/lib/businessModels';

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

const baseQuickActions = [
  { label: 'Editar mi ficha', href: '/comercio/ficha', icon: Store, desc: 'Actualizar info pública' },
  { label: 'Nueva promoción', href: '/comercio/promociones', icon: Bell, desc: 'Crear oferta o descuento' },
  { label: 'Ver comunicados', href: '/comercio/comunicados', icon: MessageSquare, desc: 'Mensajes del mall' },
  { label: 'Documentación', href: '/comercio/documentacion', icon: FileText, desc: 'Legajo digital' },
  { label: 'Coberturas', href: '/comercio/seguros', icon: ShieldCheck, desc: 'Pólizas vigentes' },
  { label: 'Tickets', href: '/comercio/tickets', icon: Ticket, desc: 'Solicitudes de mantenimiento' },
];

export default function ComercioDashboardPage() {
  const { usuario } = useAuth();
  const { commerce, loading } = useCommerce();

  const statusConf = commerce ? STATUS_CONFIG[commerce.publicStatus] : null;
  const docConf = commerce ? DOC_CONFIG[commerce.documentationStatus] : null;

  const businessModel = commerce ? getBusinessModel(commerce.category) : 'general';
  const modelConfig = MODEL_CONFIGS[businessModel];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          {commerce && !loading && (
            <span className="text-2xl">{modelConfig.emoji}</span>
          )}
          <h1 className="text-2xl font-bold text-slate-900">
            Hola, {usuario?.displayName?.split(' ')[0] ?? 'Bienvenido'}
          </h1>
        </div>
        {commerce && (
          <p className="text-slate-500 text-sm flex items-center gap-2">
            {commerce.name}
            <span className="text-slate-300">·</span>
            {commerce.category}
            {commerce.locationCode && (
              <>
                <span className="text-slate-300">·</span>
                Local {commerce.locationCode}
              </>
            )}
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
              Contactá a la administración de Mall Digital para que te asignen tu comercio.
            </p>
          </div>
        </div>
      )}

      {/* Status cards */}
      {(loading || commerce) && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
        {/* Model-specific widgets OR base actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business model quick actions */}
          {commerce && !loading && (
            <div className={`bg-gradient-to-br ${modelConfig.color} rounded-2xl border border-slate-100 shadow-sm p-6`}>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">{modelConfig.emoji}</span>
                <div>
                  <h2 className="font-semibold text-slate-900 text-sm">{modelConfig.label}</h2>
                  <p className="text-xs text-slate-500">{modelConfig.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {modelConfig.dashboardWidgets.map((widget) => (
                  <Link
                    key={widget.id}
                    href={widget.href}
                    className="bg-white rounded-xl p-4 flex items-start gap-3 hover:shadow-sm transition-all group border border-white hover:border-slate-200"
                  >
                    <span className="text-xl shrink-0">{widget.icon}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                        {widget.title}
                      </div>
                      <div className="text-xs text-slate-400 leading-tight mt-0.5">{widget.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Base quick actions */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Accesos rápidos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {baseQuickActions.map(({ label, href, icon: Icon, desc }) => (
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
        </div>

        {/* Status alerts */}
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

              {/* Pasaporte operativo */}
              <div className="mt-4 p-4 border border-slate-100 rounded-xl bg-slate-50">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Pasaporte Operativo</p>
                {[
                  { label: 'Ficha pública', ok: commerce.publicStatus !== 'no_publicado' },
                  { label: 'Documentación', ok: commerce.documentationStatus === 'completa' },
                  { label: 'Cobertura', ok: commerce.protectionStatus === 'protegido' },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center justify-between py-1">
                    <span className="text-xs text-slate-600">{label}</span>
                    {ok
                      ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Sin datos disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
}
