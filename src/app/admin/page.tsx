'use client';

import { useAuth } from '@/context/AuthContext';
import { useCommerces } from '@/hooks/useCommerces';
import Link from 'next/link';
import {
  Store, FileText, Megaphone, Ticket, AlertTriangle,
  TrendingUp, CheckCircle, Clock, ArrowRight, Bell,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { usuario } = useAuth();
  const { commerces, loading } = useCommerces();

  const totalCommerces = commerces.length;
  const published = commerces.filter((c) => c.publicStatus !== 'no_publicado').length;
  const pendingDocs = commerces.filter((c) => c.documentationStatus !== 'completa').length;
  const featured = commerces.filter((c) => c.publicStatus === 'destacado').length;

  const stats = [
    { label: 'Locales totales', value: totalCommerces, icon: Store, color: 'bg-blue-500', href: '/admin/comercios' },
    { label: 'Publicados', value: published, icon: CheckCircle, color: 'bg-emerald-500', href: '/admin/comercios' },
    { label: 'Doc. pendiente', value: pendingDocs, icon: AlertTriangle, color: 'bg-amber-500', href: '/admin/comercios' },
    { label: 'Destacados', value: featured, icon: TrendingUp, color: 'bg-purple-500', href: '/admin/comercios' },
  ];

  const quickActions = [
    { label: 'Ver comercios', href: '/admin/comercios', icon: Store, desc: 'Listado completo de locales' },
    { label: 'Enviar comunicado', href: '/admin/comunicaciones', icon: Megaphone, desc: 'Notificar a los comercios' },
    { label: 'Documentación', href: '/admin/documentacion', icon: FileText, desc: 'Semáforo documental' },
    { label: 'Promociones', href: '/admin/promociones', icon: Bell, desc: 'Aprobar y gestionar' },
    { label: 'Tickets', href: '/admin/tickets', icon: Ticket, desc: 'Solicitudes de mantenimiento' },
  ];

  const alertCommerces = commerces
    .filter((c) => c.documentationStatus !== 'completa')
    .slice(0, 4);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Bienvenido, {usuario?.displayName?.split(' ')[0] ?? 'Admin'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">Panel de administración — Mall Digital</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-slate-200 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            {loading ? (
              <div className="h-8 w-12 bg-slate-100 rounded animate-pulse mb-1" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{value}</div>
            )}
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
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

        {/* Alerts */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Atención requerida
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : alertCommerces.length === 0 ? (
            <div className="text-center py-6">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Todo al día</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alertCommerces.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/comercios/${c.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-amber-700">
                      {c.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <Clock className="w-3 h-3" />
                      Doc. {c.documentationStatus === 'parcial' ? 'parcial' : 'pendiente'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
