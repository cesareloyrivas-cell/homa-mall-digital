'use client';

import { useState } from 'react';
import { Commerce } from '@/types';

type OwnerEditable = Pick<
  Commerce,
  'description' | 'whatsapp' | 'instagram' | 'email' | 'phone' | 'schedule'
>;

interface Props {
  initial: OwnerEditable;
  readonlyInfo: { name: string; category: string; locationCode?: string };
  onSubmit: (data: OwnerEditable) => Promise<void>;
}

const inputCls =
  'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function CommerceOwnerForm({ initial, readonlyInfo, onSubmit }: Props) {
  const [form, setForm] = useState<OwnerEditable>(initial);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof OwnerEditable>(key: K, value: OwnerEditable[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Info de solo lectura */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Datos del local (administrados por Mall Digital)
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Nombre comercial</p>
            <p className="text-sm font-semibold text-slate-900">{readonlyInfo.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Rubro</p>
            <p className="text-sm font-semibold text-slate-900">{readonlyInfo.category}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Número de local</p>
            <p className="text-sm font-semibold text-slate-900">
              {readonlyInfo.locationCode ?? '—'}
            </p>
          </div>
        </div>
      </section>

      {/* Descripción */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100">
          Descripción
        </h2>
        <Field label="Descripción pública">
          <textarea
            rows={4}
            className={inputCls}
            placeholder="Contá en pocas palabras qué ofrece tu comercio. Aparece en tu ficha pública."
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>
      </section>

      {/* Contacto */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100">
          Contacto
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="WhatsApp (sin +, con cód. de país)">
            <input
              type="text"
              className={inputCls}
              placeholder="5493514561234"
              value={form.whatsapp ?? ''}
              onChange={(e) => set('whatsapp', e.target.value)}
            />
          </Field>
          <Field label="Instagram (sin @)">
            <input
              type="text"
              className={inputCls}
              placeholder="mi_local"
              value={form.instagram ?? ''}
              onChange={(e) => set('instagram', e.target.value)}
            />
          </Field>
          <Field label="Email de contacto">
            <input
              type="email"
              className={inputCls}
              placeholder="milocal@email.com"
              value={form.email ?? ''}
              onChange={(e) => set('email', e.target.value)}
            />
          </Field>
          <Field label="Teléfono">
            <input
              type="text"
              className={inputCls}
              placeholder="3541 123456"
              value={form.phone ?? ''}
              onChange={(e) => set('phone', e.target.value)}
            />
          </Field>
        </div>
      </section>

      {/* Horarios */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100">
          Horarios
        </h2>
        <Field label="Horarios de atención (separá rangos con |)">
          <input
            type="text"
            className={inputCls}
            placeholder="Lun–Vie 9 a 21 hs | Sáb 10 a 20 hs | Dom cerrado"
            value={form.schedule ?? ''}
            onChange={(e) => set('schedule', e.target.value)}
          />
        </Field>
        <p className="text-xs text-slate-400 mt-2">
          Ejemplo: <span className="font-mono">Lun–Vie 9 a 21 hs | Sáb 10 a 20 hs</span>
        </p>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl text-sm transition-colors"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}
