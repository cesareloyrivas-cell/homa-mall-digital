'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Search, Plus, Store, AlertTriangle, CheckCircle, RefreshCw,
} from 'lucide-react';
import { PublicStatus } from '@/types';
import { useCommerces } from '@/hooks/useCommerces';

const STATUS_LABELS: Record<PublicStatus, { label: string; color: string }> = {
  destacado: { label: 'Destacado', color: 'text-amber-700 bg-amber-100' },
  verificado: { label: 'Verificado', color: 'text-emerald-700 bg-emerald-100' },
  protegido: { label: 'Protegido', color: 'text-blue-700 bg-blue-100' },
  publicado: { label: 'Publicado', color: 'text-slate-700 bg-slate-100' },
  no_publicado: { label: 'No publicado', color: 'text-red-700 bg-red-100' },
};

const DOC_STATUS = {
  completa: { label: 'Completa', icon: CheckCircle, color: 'text-emerald-600' },
  parcial: { label: 'Parcial', icon: AlertTriangle, color: 'text-amber-600' },
  pendiente: { label: 'Pendiente', icon: AlertTriangle, color: 'text-red-600' },
};

export default function AdminComerciosPage() {
  const { commerces, loading, error, refresh } = useCommerces();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      commerces.filter(
        (c) =>
          !search ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.category.toLowerCase().includes(search.toLowerCase()) ||
          c.locationCode?.toLowerCase().includes(search.toLowerCase())
      ),
    [commerces, search]
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Comercios</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading ? 'Cargando...' : `${commerces.length} locales registrados`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/comercios/nuevo"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo comercio
          </Link>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, rubro o local..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:max-w-sm pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Error al cargar comercios: {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Comercio
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden sm:table-cell">
                    Rubro
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">
                    Local
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">
                    Estado público
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">
                    Documentación
                  </th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => {
                  const status = STATUS_LABELS[c.publicStatus];
                  const doc = DOC_STATUS[c.documentationStatus];
                  const DocIcon = doc.icon;
                  const initials = c.name
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-amber-400">{initials}</span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{c.name}</div>
                            {c.legalName && (
                              <div className="text-xs text-slate-400 truncate max-w-[160px]">
                                {c.legalName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-600 hidden sm:table-cell">{c.category}</td>
                      <td className="px-4 py-4 text-slate-500 hidden md:table-cell">
                        {c.locationCode ?? '—'}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <div className={`flex items-center gap-1.5 text-xs font-medium ${doc.color}`}>
                          <DocIcon className="w-3.5 h-3.5" />
                          {doc.label}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/admin/comercios/${c.id}`}
                          className="text-xs font-medium text-amber-600 hover:text-amber-700"
                        >
                          Editar →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-12">
                <Store className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">
                  {search ? `Sin resultados para "${search}"` : 'No hay comercios todavía.'}
                </p>
                {!search && (
                  <Link
                    href="/admin/comercios/nuevo"
                    className="mt-3 inline-block text-sm font-medium text-amber-600 hover:text-amber-700"
                  >
                    Crear el primero →
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
