'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Store,
  Megaphone,
  FileText,
  MessageSquare,
  Ticket,
  Package,
  Users,
  ShieldCheck,
  LogOut,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Bell,
} from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/comercios', label: 'Comercios', icon: Store },
  { href: '/admin/comunicaciones', label: 'Comunicaciones', icon: Megaphone },
  { href: '/admin/documentacion', label: 'Documentación', icon: FileText },
  { href: '/admin/promociones', label: 'Promociones', icon: Bell },
  { href: '/admin/tickets', label: 'Tickets', icon: Ticket },
  { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
];

const COMERCIO_LINKS = [
  { href: '/comercio', label: 'Mi Panel', icon: LayoutDashboard },
  { href: '/comercio/ficha', label: 'Mi Ficha', icon: Store },
  { href: '/comercio/promociones', label: 'Promociones', icon: Bell },
  { href: '/comercio/comunicados', label: 'Comunicados', icon: MessageSquare },
  { href: '/comercio/documentacion', label: 'Documentación', icon: FileText },
  { href: '/comercio/productos', label: 'Productos', icon: Package },
  { href: '/comercio/tickets', label: 'Tickets', icon: Ticket },
  { href: '/comercio/seguros', label: 'Seguros', icon: ShieldCheck },
];

export default function DashboardSidebar() {
  const { usuario, signOut } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const links = usuario?.role === 'admin_mall' || usuario?.role === 'super_admin'
    ? ADMIN_LINKS
    : COMERCIO_LINKS;

  const homeHref = usuario?.role === 'admin_mall' || usuario?.role === 'super_admin'
    ? '/admin'
    : '/comercio';

  return (
    <aside
      className={`flex flex-col bg-slate-900 text-white transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      } min-h-screen shrink-0`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-700">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
          <ShoppingBag className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sm tracking-tight">
            HOMA <span className="text-amber-400">Mall</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded hover:bg-white/10 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && usuario && (
        <div className="px-4 py-3 border-b border-slate-700">
          <p className="text-xs text-slate-400">Sesión activa</p>
          <p className="text-sm font-medium text-white truncate">{usuario.displayName}</p>
          <span className="text-xs text-amber-400 capitalize">
            {usuario.role.replace('_', ' ')}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== homeHref && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-amber-500 text-slate-900'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer: back to public + logout */}
      <div className="px-2 py-4 border-t border-slate-700 space-y-1">
        <Link
          href="/"
          title={collapsed ? 'Ir al sitio público' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ShoppingBag className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sitio público</span>}
        </Link>
        <button
          onClick={signOut}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
