'use client';

import { useEffect, useState, useMemo } from 'react';
import { getAllUsers, updateUser } from '@/lib/userService';
import { getCommerces } from '@/lib/commerceService';
import { AppUser, UserRole, Commerce } from '@/types';
import {
  Users, Plus, Copy, Link2, Check, X, RefreshCw,
  ShieldCheck, Store, UserX, UserCheck2, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
  admin_mall: { label: 'Admin Mall', color: 'bg-blue-100 text-blue-700' },
  propietario_comercio: { label: 'Propietario', color: 'bg-amber-100 text-amber-700' },
  operador_comercio: { label: 'Operador', color: 'bg-slate-100 text-slate-600' },
  operador: { label: 'Operador', color: 'bg-slate-100 text-slate-600' },
};

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'admin_mall', label: 'Admin Mall' },
  { value: 'propietario_comercio', label: 'Propietario de comercio' },
  { value: 'operador_comercio' as UserRole, label: 'Operador de comercio' },
];

const inputCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent';

const EMPTY_FORM = { email: '', displayName: '', role: 'propietario_comercio' as UserRole, commerceId: '' };

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [commerces, setCommerces] = useState<Commerce[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('todos');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [togglingFor, setTogglingFor] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [u, c] = await Promise.all([getAllUsers(), getCommerces()]);
      setUsers(u);
      setCommerces(c);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() =>
    filterRole === 'todos' ? users : users.filter(u => u.role === filterRole),
    [users, filterRole]
  );

  function getCommerceName(id?: string) {
    if (!id) return null;
    return commerces.find(c => c.id === id)?.name ?? id;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          displayName: form.displayName || undefined,
          role: form.role,
          commerceId: form.commerceId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResetLink(data.resetLink);
      setShowForm(false);
      setForm(EMPTY_FORM);
      toast.success('Usuario creado. Copiá el link de acceso.');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear usuario.');
    } finally {
      setSaving(false);
    }
  }

  async function generateLink(email: string) {
    setGeneratingFor(email);
    try {
      const res = await fetch('/api/admin/reset-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResetLink(data.resetLink);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'No se pudo generar el link.');
    } finally {
      setGeneratingFor(null);
    }
  }

  async function toggleUser(user: AppUser) {
    setTogglingFor(user.uid);
    const newDisabled = user.isActive !== false;
    try {
      const res = await fetch('/api/admin/reset-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, disabled: newDisabled }),
      });
      if (!res.ok) throw new Error();
      toast.success(newDisabled ? 'Usuario desactivado.' : 'Usuario reactivado.');
      load();
    } catch {
      toast.error('No se pudo actualizar el estado.');
    } finally {
      setTogglingFor(null);
    }
  }

  async function copyLink(link: string) {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link copiado al portapapeles.');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-sm text-slate-500 mt-0.5">{loading ? 'Cargando...' : `${users.length} usuarios registrados`}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
          >
            <Plus className="w-4 h-4" /> Crear usuario
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {['todos', 'admin_mall', 'propietario_comercio', 'operador_comercio'].map(role => {
          const count = role === 'todos' ? users.length : users.filter(u => u.role === role).length;
          const label = role === 'todos' ? 'Todos' : (ROLE_CONFIG[role]?.label ?? role);
          return (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                filterRole === role ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
              {count > 0 && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold bg-slate-200 text-slate-600">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-900">Crear usuario</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Email *</label>
                <input required type="email" className={inputCls} placeholder="usuario@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Nombre</label>
                <input type="text" className={inputCls} placeholder="Nombre y apellido" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Rol *</label>
                <select className={inputCls} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}>
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              {form.role === 'propietario_comercio' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Comercio</label>
                  <select className={inputCls} value={form.commerceId} onChange={e => setForm(f => ({ ...f, commerceId: e.target.value }))}>
                    <option value="">Sin asignar</option>
                    {commerces.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900">Cancelar</button>
              <button type="submit" disabled={saving} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-900 font-bold rounded-xl text-sm">
                {saving ? 'Creando...' : 'Crear y generar link'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reset link modal */}
      {resetLink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Link2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Link de acceso generado</h3>
                <p className="text-xs text-slate-500">Válido por 24 horas · Compartilo con el propietario</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 break-all text-xs font-mono text-slate-600 select-all">
              {resetLink}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => copyLink(resetLink)}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? '¡Copiado!' : 'Copiar link'}
              </button>
              <button
                onClick={() => setResetLink(null)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl text-sm hover:bg-slate-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No hay usuarios en esta categoría.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-5 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Usuario</th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider">Rol</th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden md:table-cell">Comercio</th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider hidden lg:table-cell">Estado</th>
                  <th className="px-4 py-3.5 font-semibold text-slate-600 text-xs uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => {
                  const roleConf = ROLE_CONFIG[u.role] ?? { label: u.role, color: 'bg-slate-100 text-slate-600' };
                  const isActive = u.isActive !== false;
                  const commerceName = getCommerceName(u.commerceId);
                  const initials = (u.displayName || u.email || '?').slice(0, 2).toUpperCase();
                  return (
                    <tr key={u.uid} className={`hover:bg-slate-50 transition-colors ${!isActive ? 'opacity-50' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-amber-400">{initials}</span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{u.displayName || '(sin nombre)'}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${roleConf.color}`}>
                          {roleConf.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        {commerceName ? (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Store className="w-3.5 h-3.5 text-slate-400" />
                            {commerceName}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => generateLink(u.email)}
                            disabled={generatingFor === u.email}
                            title="Generar link de acceso"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {generatingFor === u.email
                              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              : <Link2 className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => toggleUser(u)}
                            disabled={togglingFor === u.uid}
                            title={isActive ? 'Desactivar' : 'Reactivar'}
                            className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                              isActive
                                ? 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck2 className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
