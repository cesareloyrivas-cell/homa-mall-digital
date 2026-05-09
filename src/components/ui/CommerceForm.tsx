'use client';

import { useState } from 'react';
import { Commerce, PublicStatus, InternalStatus, COMMERCE_CATEGORIES } from '@/types';

type FormData = Omit<Commerce, 'id' | 'slug' | 'tenantId' | 'createdAt' | 'updatedAt'>;

const EMPTY: FormData = {
  name: '',
  legalName: '',
  cuit: '',
  category: COMMERCE_CATEGORIES[0],
  subcategory: '',
  locationCode: '',
  description: '',
  whatsapp: '',
  instagram: '',
  email: '',
  phone: '',
  schedule: '',
  publicStatus: 'no_publicado',
  internalStatus: 'pendiente_alta',
  documentationStatus: 'pendiente',
  protectionStatus: 'sin_cobertura',
  isFeatured: false,
};

const PUBLIC_STATUS_OPTIONS: { value: PublicStatus; label: string }[] = [
  { value: 'no_publicado', label: 'No publicado' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'verificado', label: 'Verificado' },
  { value: 'protegido', label: 'Protegido' },
  { value: 'destacado', label: 'Destacado' },
];

const INTERNAL_STATUS_OPTIONS: { value: InternalStatus; label: string }[] = [
  { value: 'pendiente_alta', label: 'Pendiente de alta' },
  { value: 'alta_iniciada', label: 'Alta iniciada' },
  { value: 'ficha_incompleta', label: 'Ficha incompleta' },
  { value: 'legajo_iniciado', label: 'Legajo iniciado' },
  { value: 'documentacion_parcial', label: 'Documentación parcial' },
  { value: 'documentacion_completa', label: 'Documentación completa' },
  { value: 'cobertura_informada', label: 'Cobertura informada' },
  { value: 'cobertura_revisada', label: 'Cobertura revisada' },
  { value: 'vencimientos_al_dia', label: 'Vencimientos al día' },
  { value: 'observado', label: 'Observado' },
  { value: 'pendiente_critico', label: 'Pendiente crítico' },
];

interface Props {
  initial?: Partial<FormData>;
  onSubmit: (data: FormData, ownerEmail?: string) => Promise<void>;
  submitLabel: string;
  showOwnerEmail?: boolean;
}

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

const inputCls =
  'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent';

const selectCls =
  'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white';

export default function CommerceForm({ initial = {}, onSubmit, submitLabel, showOwnerEmail }: Props) {
  const [form, setForm] = useState<FormData>({ ...EMPTY, ...initial });
  const [ownerEmail, setOwnerEmail] = useState('');
  const [saving, setSaving] = useState(false);

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSubmit(form, ownerEmail || undefined);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Sección 1 — Datos básicos */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100">
          Datos del comercio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre comercial *">
            <input
              required
              type="text"
              className={inputCls}
              placeholder="Ej: Café del Centro"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </Field>
          <Field label="Razón social">
            <input
              type="text"
              className={inputCls}
              placeholder="Ej: García SA"
              value={form.legalName ?? ''}
              onChange={(e) => set('legalName', e.target.value)}
            />
          </Field>
          <Field label="CUIT">
            <input
              type="text"
              className={inputCls}
              placeholder="20-12345678-9"
              value={form.cuit ?? ''}
              onChange={(e) => set('cuit', e.target.value)}
            />
          </Field>
          <Field label="Número de local">
            <input
              type="text"
              className={inputCls}
              placeholder="Ej: A-12"
              value={form.locationCode ?? ''}
              onChange={(e) => set('locationCode', e.target.value)}
            />
          </Field>
          <Field label="Rubro *">
            <select
              required
              className={selectCls}
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
            >
              {COMMERCE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </Field>
          <Field label="Sub-rubro">
            <input
              type="text"
              className={inputCls}
              placeholder="Ej: Café y pastelería"
              value={form.subcategory ?? ''}
              onChange={(e) => set('subcategory', e.target.value)}
            />
          </Field>
          <div className="md:col-span-2">
            <Field label="Descripción">
              <textarea
                rows={3}
                className={inputCls}
                placeholder="Breve descripción del comercio para la ficha pública..."
                value={form.description ?? ''}
                onChange={(e) => set('description', e.target.value)}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Sección 2 — Contacto */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100">
          Contacto y horarios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="nombre_local"
              value={form.instagram ?? ''}
              onChange={(e) => set('instagram', e.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputCls}
              placeholder="local@email.com"
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
          <div className="md:col-span-2">
            <Field label="Horarios (separá rangos con |)">
              <input
                type="text"
                className={inputCls}
                placeholder="Lun–Vie 9 a 21 hs | Sáb 10 a 20 hs"
                value={form.schedule ?? ''}
                onChange={(e) => set('schedule', e.target.value)}
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Sección 3 — Estado */}
      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-slate-900 mb-5 pb-3 border-b border-slate-100">
          Estado y visibilidad
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Estado público">
            <select
              className={selectCls}
              value={form.publicStatus}
              onChange={(e) => set('publicStatus', e.target.value as PublicStatus)}
            >
              {PUBLIC_STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Estado interno">
            <select
              className={selectCls}
              value={form.internalStatus}
              onChange={(e) => set('internalStatus', e.target.value as InternalStatus)}
            >
              {INTERNAL_STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Documentación">
            <select
              className={selectCls}
              value={form.documentationStatus}
              onChange={(e) =>
                set('documentationStatus', e.target.value as Commerce['documentationStatus'])
              }
            >
              <option value="pendiente">Pendiente</option>
              <option value="parcial">Parcial</option>
              <option value="completa">Completa</option>
            </select>
          </Field>
          <Field label="Protección">
            <select
              className={selectCls}
              value={form.protectionStatus}
              onChange={(e) =>
                set('protectionStatus', e.target.value as Commerce['protectionStatus'])
              }
            >
              <option value="sin_cobertura">Sin cobertura</option>
              <option value="parcial">Parcial</option>
              <option value="protegido">Protegido</option>
            </select>
          </Field>
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="isFeatured"
              checked={form.isFeatured ?? false}
              onChange={(e) => set('isFeatured', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 accent-amber-500"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700">
              Destacar en home
            </label>
          </div>
        </div>
      </section>

      {/* Sección: acceso del propietario (solo al crear) */}
      {showOwnerEmail && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900 mb-1">Acceso del propietario</h2>
          <p className="text-xs text-slate-500 mb-4">
            Opcional. Si ingresás un email, le llegará un correo de bienvenida con un link para
            crear su contraseña y acceder al panel de gestión del comercio.
          </p>
          <Field label="Email del propietario del local">
            <input
              type="email"
              className={inputCls}
              placeholder="propietario@email.com"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
            />
          </Field>
        </section>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl text-sm transition-colors"
        >
          {saving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
