'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCommerces } from '@/hooks/useCommerces';
import { getTickets } from '@/lib/ticketService';
import { getBusinessModel, MODEL_CONFIGS } from '@/lib/businessModels';
import { Commerce, Ticket } from '@/types';
import {
  Store, FileText, Ticket as TicketIcon, ShieldCheck, Megaphone,
  Bell, AlertTriangle, CheckCircle, ArrowRight, RefreshCw,
  TrendingUp, Users, ShieldPlus, Sprout,
} from 'lucide-react';

// ─── Helpers de color ──────────────────────────────────────────────────────────

function docStatusConf(status: Commerce['documentationStatus']) {
  if (status === 'completa')  return { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Docs OK' };
  if (status === 'parcial')   return { dot: 'bg-amber-400',   text: 'text-amber-700',   label: 'Docs parcial' };
  return                             { dot: 'bg-red-500',     text: 'text-red-600',     label: 'Docs pend.' };
}

function covStatusConf(status: Commerce['protectionStatus']) {
  if (status === 'protegido')    return { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'Cob. OK' };
  if (status === 'parcial')      return { dot: 'bg-amber-400',   text: 'text-amber-700',   label: 'Cob. parcial' };
  return                                { dot: 'bg-red-500',     text: 'text-red-600',     label: 'Sin cob.' };
}

function riskLevel(c: Commerce): 2 | 1 | 0 {
  const badDoc = c.documentationStatus !== 'completa';
  const badCov = c.protectionStatus === 'sin_cobertura';
  const partialCov = c.protectionStatus === 'parcial';
  if (badDoc && badCov) return 2;
  if (badDoc || badCov || partialCov) return 1;
  return 0;
}

const OPEN_STATUSES = new Set(['nuevo', 'recibido', 'en_revision', 'asignado', 'en_proceso']);

// ─── Componente tarjeta de comercio ───────────────────────────────────────────

function CommerceHealthTile({
  commerce,
  ticketCount,
}: {
  commerce: Commerce;
  ticketCount: number;
}) {
  const model = getBusinessModel(commerce.category);
  const emoji = MODEL_CONFIGS[model].emoji;
  const risk = riskLevel(commerce);
  const doc = docStatusConf(commerce.documentationStatus);
  const cov = covStatusConf(commerce.protectionStatus);

  const borderCls =
    risk === 2 ? 'border-red-200 bg-red-50/40' :
    risk === 1 ? 'border-amber-200 bg-amber-50/30' :
    'border-slate-100 bg-white';

  return (
    <Link
      href="/admin/comercios"
      className={`block rounded-xl border p-3 hover:shadow-sm transition-all group ${borderCls}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 text-xs leading-tight truncate group-hover:text-amber-700 transition-colors">
            {commerce.name}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {emoji} {commerce.locationCode ?? commerce.category}
          </p>
        </div>
        {ticketCount > 0 && (
          <span className="shrink-0 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
            {ticketCount} ticket{ticketCount > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Status pills */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${doc.dot}`} />
          <span className={`text-[10px] font-medium ${doc.text}`}>{doc.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cov.dot}`} />
          <span className={`text-[10px] font-medium ${cov.text}`}>{cov.label}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { usuario } = useAuth();
  const { commerces, loading: commercesLoading, refresh } = useCommerces();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  useEffect(() => {
    getTickets()
      .then(setTickets)
      .catch(() => {})
      .finally(() => setTicketsLoading(false));
  }, []);

  const loading = commercesLoading || ticketsLoading;

  // ── Derived stats ──────────────────────────────────────────────────────────

  const totalCommerces    = commerces.length;
  const publishedCount    = commerces.filter((c) => c.publicStatus !== 'no_publicado').length;
  const docCompletaCount  = commerces.filter((c) => c.documentationStatus === 'completa').length;
  const sinCoberturaCount = commerces.filter((c) => c.protectionStatus === 'sin_cobertura').length;

  const openTickets = useMemo(
    () => tickets.filter((t) => OPEN_STATUSES.has(t.status)),
    [tickets],
  );
  const urgentTickets = useMemo(
    () => openTickets.filter((t) => t.priority === 'urgente' || t.priority === 'alta'),
    [openTickets],
  );

  const ticketCountByCommerce = useMemo(() => {
    const map: Record<string, number> = {};
    openTickets.forEach((t) => {
      map[t.commerceId] = (map[t.commerceId] ?? 0) + 1;
    });
    return map;
  }, [openTickets]);

  // Sort: crítico (2) → atención (1) → OK (0)
  const sortedCommerces = useMemo(
    () => [...commerces].sort((a, b) => riskLevel(b) - riskLevel(a)),
    [commerces],
  );

  // Alert lists
  const criticalCommerces = commerces.filter(
    (c) => c.documentationStatus !== 'completa' && c.protectionStatus === 'sin_cobertura'
  );
  const docPendingOnly = commerces.filter(
    (c) => c.documentationStatus !== 'completa' && c.protectionStatus !== 'sin_cobertura'
  );

  // Mall health
  const healthyCount = commerces.filter((c) => riskLevel(c) === 0).length;
  const healthScore  = totalCommerces > 0 ? Math.round((healthyCount / totalCommerces) * 100) : 0;
  const mallStatus   = healthScore === 100 ? 'verde' : healthScore >= 60 ? 'amarillo' : 'rojo';

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const kpis = [
    {
      label: 'Comercios',
      value: totalCommerces,
      icon: Store,
      bg: 'bg-blue-500',
      href: '/admin/comercios',
      sub: `${publishedCount} publicados`,
    },
    {
      label: 'Legajos completos',
      value: docCompletaCount,
      icon: FileText,
      bg: docCompletaCount === totalCommerces && totalCommerces > 0 ? 'bg-emerald-500' : 'bg-amber-500',
      href: '/admin/documentacion',
      sub: totalCommerces > 0 ? `de ${totalCommerces} totales` : '—',
    },
    {
      label: 'Sin cobertura',
      value: sinCoberturaCount,
      icon: ShieldPlus,
      bg: sinCoberturaCount > 0 ? 'bg-red-500' : 'bg-emerald-500',
      href: '/admin/coberturas',
      sub: sinCoberturaCount > 0 ? 'requieren atención' : 'todos cubiertos',
    },
    {
      label: 'Tickets abiertos',
      value: openTickets.length,
      icon: TicketIcon,
      bg: openTickets.length > 0 ? 'bg-amber-500' : 'bg-emerald-500',
      href: '/admin/tickets',
      sub: urgentTickets.length > 0 ? `${urgentTickets.length} urgentes` : 'sin urgentes',
    },
    {
      label: 'Destacados',
      value: commerces.filter((c) => c.publicStatus === 'destacado').length,
      icon: TrendingUp,
      bg: 'bg-purple-500',
      href: '/admin/comercios',
      sub: 'en vitrina pública',
    },
  ];

  const quickActions = [
    { label: 'Comercios',      href: '/admin/comercios',      icon: Store,       desc: 'Listado y edición' },
    { label: 'Usuarios',       href: '/admin/usuarios',       icon: Users,       desc: 'Crear y vincular' },
    { label: 'Comunicaciones', href: '/admin/comunicaciones', icon: Megaphone,   desc: 'Publicar avisos' },
    { label: 'Documentación',  href: '/admin/documentacion',  icon: FileText,    desc: 'Semáforo de legajos' },
    { label: 'Coberturas',     href: '/admin/coberturas',     icon: ShieldCheck, desc: 'Pólizas por comercio' },
    { label: 'Tickets',        href: '/admin/tickets',        icon: TicketIcon,  desc: 'Solicitudes y soporte' },
    { label: 'Promociones',    href: '/admin/promociones',    icon: Bell,        desc: 'Aprobar y gestionar' },
    { label: 'Datos demo',     href: '/admin/seed',           icon: Sprout,      desc: 'Comercios de prueba' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bienvenido, {usuario?.displayName?.split(' ')[0] ?? 'Admin'} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-0.5 capitalize">{today}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mall health pill */}
          {!loading && totalCommerces > 0 && (
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border ${
              mallStatus === 'verde'   ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
              mallStatus === 'amarillo' ? 'bg-amber-50 border-amber-200 text-amber-700' :
              'bg-red-50 border-red-200 text-red-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                mallStatus === 'verde' ? 'bg-emerald-500' :
                mallStatus === 'amarillo' ? 'bg-amber-400' : 'bg-red-500'
              }`} />
              {healthScore}% del mall saludable
            </div>
          )}
          <button
            onClick={refresh}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {kpis.map(({ label, value, icon: Icon, bg, href, sub }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md hover:border-slate-200 transition-all group"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${bg} group-hover:scale-105 transition-transform`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            {loading ? (
              <div className="h-7 w-10 bg-slate-100 rounded animate-pulse mb-1" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{value}</div>
            )}
            <div className="text-xs font-medium text-slate-600 mt-0.5">{label}</div>
            {!loading && (
              <div className="text-[10px] text-slate-400 mt-0.5">{sub}</div>
            )}
          </Link>
        ))}
      </div>

      {/* ── Salud del mall ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-900 text-sm">Salud del mall</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Documentación y cobertura por local — click para gestionar
            </p>
          </div>
          {!loading && (
            <div className="flex gap-3 text-[10px] font-medium text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> OK</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Atención</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Crítico</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : sortedCommerces.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No hay comercios registrados. <Link href="/admin/seed" className="text-amber-600 underline">Cargar datos demo</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {sortedCommerces.map((c) => (
              <CommerceHealthTile
                key={c.id}
                commerce={c}
                ticketCount={ticketCountByCommerce[c.id] ?? 0}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom row: Alertas + Accesos ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Alertas — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Alertas y atención requerida
          </h2>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : criticalCommerces.length === 0 && docPendingOnly.length === 0 && urgentTickets.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Todo en orden</p>
              <p className="text-xs text-slate-400 mt-1">
                Sin comercios críticos ni tickets urgentes pendientes.
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {/* Críticos */}
              {criticalCommerces.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    Crítico — sin docs ni cobertura ({criticalCommerces.length})
                  </p>
                  <div className="space-y-1.5">
                    {criticalCommerces.slice(0, 5).map((c) => (
                      <Link key={c.id} href="/admin/documentacion"
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-red-50 border border-red-100 transition-colors">
                        <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-red-700">{c.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 truncate">{c.name}</p>
                          <p className="text-[10px] text-red-600">Docs pendiente · Sin cobertura</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      </Link>
                    ))}
                    {criticalCommerces.length > 5 && (
                      <p className="text-xs text-slate-400 pl-2.5">+ {criticalCommerces.length - 5} más</p>
                    )}
                  </div>
                </div>
              )}

              {/* Doc incompleta */}
              {docPendingOnly.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    Documentación incompleta ({docPendingOnly.length})
                  </p>
                  <div className="space-y-1.5">
                    {docPendingOnly.slice(0, 4).map((c) => (
                      <Link key={c.id} href="/admin/documentacion"
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 border border-amber-100 transition-colors">
                        <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-amber-700">{c.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 truncate">{c.name}</p>
                          <p className="text-[10px] text-amber-600">
                            Legajo {c.documentationStatus === 'parcial' ? 'parcial' : 'pendiente'}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      </Link>
                    ))}
                    {docPendingOnly.length > 4 && (
                      <p className="text-xs text-slate-400 pl-2.5">+ {docPendingOnly.length - 4} más</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tickets urgentes */}
              {urgentTickets.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <TicketIcon className="w-3 h-3" />
                    Tickets urgentes/altos ({urgentTickets.length})
                  </p>
                  <div className="space-y-1.5">
                    {urgentTickets.slice(0, 4).map((t) => (
                      <Link key={t.id} href="/admin/tickets"
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 transition-colors">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          t.priority === 'urgente' ? 'bg-red-100' : 'bg-amber-100'
                        }`}>
                          <TicketIcon className={`w-3.5 h-3.5 ${
                            t.priority === 'urgente' ? 'text-red-600' : 'text-amber-600'
                          }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-900 truncate">{t.title}</p>
                          <p className={`text-[10px] capitalize ${
                            t.priority === 'urgente' ? 'text-red-600' : 'text-amber-600'
                          }`}>
                            {t.priority} · {t.type}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      </Link>
                    ))}
                    {urgentTickets.length > 4 && (
                      <p className="text-xs text-slate-400 pl-2.5">+ {urgentTickets.length - 4} más</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Accesos rápidos — 1/3 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-900 text-sm mb-4">Accesos rápidos</h2>
          <div className="space-y-1">
            {quickActions.map(({ label, href, icon: Icon, desc }) => (
              <Link key={href} href={href}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50 hover:border-amber-100 border border-transparent transition-all group">
                <div className="w-7 h-7 bg-slate-100 group-hover:bg-amber-100 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-600 transition-colors" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 leading-tight">{label}</p>
                  <p className="text-[10px] text-slate-400">{desc}</p>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-200 group-hover:text-amber-400 ml-auto shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
