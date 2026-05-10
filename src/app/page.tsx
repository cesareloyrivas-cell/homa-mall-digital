'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, MapPin, Clock, Phone, Tag, Mail, Globe,
  ShieldCheck, BadgeCheck, Flame, Store, Megaphone, FileText,
  Ticket, Star, Coffee, ShoppingBag, Wrench, Heart, Gamepad2,
  Building2, TrendingUp, Users, CheckCircle2,
} from 'lucide-react';
import { getCommerces } from '@/lib/commerceService';
import { getApprovedPromotions } from '@/lib/promotionService';
import { Commerce, Promotion } from '@/types';
import CommerceCard from '@/components/ui/CommerceCard';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';

const CATEGORIES = [
  { label: 'Gastronomía', icon: Coffee, color: 'bg-orange-50 text-orange-600 border-orange-100', href: '/locales?cat=Gastronomía' },
  { label: 'Compras', icon: ShoppingBag, color: 'bg-purple-50 text-purple-600 border-purple-100', href: '/locales?cat=Indumentaria' },
  { label: 'Servicios', icon: Wrench, color: 'bg-blue-50 text-blue-600 border-blue-100', href: '/locales?cat=Servicios' },
  { label: 'Entretenimiento', icon: Gamepad2, color: 'bg-yellow-50 text-yellow-600 border-yellow-100', href: '/locales?cat=Entretenimiento' },
  { label: 'Salud y bienestar', icon: Heart, color: 'bg-red-50 text-red-600 border-red-100', href: '/locales?cat=Salud+y+Bienestar' },
  { label: 'Promociones', icon: Tag, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', href: '/promociones' },
];

const DIGITAL_FEATURES = [
  { icon: Megaphone, title: 'Comunicaciones internas ordenadas', desc: 'Circulares segmentadas por rubro, prioridad y confirmación de lectura.' },
  { icon: FileText, title: 'Legajo digital por comercio', desc: 'Documentación centralizada con semáforo de estado y vencimientos.' },
  { icon: Tag, title: 'Promociones centralizadas', desc: 'Aprobación y publicación automática de ofertas en el sitio público.' },
  { icon: Ticket, title: 'Tickets de mantenimiento', desc: 'Reportes de electricidad, limpieza y servicios del mall con seguimiento.' },
  { icon: ShieldCheck, title: 'Coberturas y protección', desc: 'Control de pólizas, vencimientos y estado de protección de cada local.' },
  { icon: BadgeCheck, title: 'Comercios verificados', desc: 'Proceso de validación que diferencia y jerarquiza a los locales.' },
];

const TERRITORY_CARDS = [
  { icon: Building2, title: 'Corredor Córdoba–Carlos Paz', desc: 'Uno de los corredores comerciales de mayor crecimiento de la región centro.' },
  { icon: Users, title: 'Zona residencial en expansión', desc: 'Rodeado de barrios privados, countries y nuevos desarrollos urbanos.' },
  { icon: TrendingUp, title: 'Flujo turístico y permanente', desc: 'Carlos Paz recibe más de 2 millones de turistas anuales.' },
  { icon: Star, title: 'Nuevo polo comercial', desc: 'HOMA Mall se posiciona como referente del consumo moderno en la región.' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Commerce[]>([]);
  const [promos, setPromos] = useState<Promotion[]>([]);

  useEffect(() => {
    getCommerces().then(all => {
      const highlights = all.filter(c => c.isFeatured && c.publicStatus !== 'no_publicado').slice(0, 6);
      setFeatured(highlights.length > 0 ? highlights : all.filter(c => c.publicStatus !== 'no_publicado').slice(0, 6));
    });
    getApprovedPromotions().then(p => setPromos(p.slice(0, 3)));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-1">

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="relative bg-slate-950 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40" />
          {/* Decorative circles */}
          <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-40">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/25 text-amber-300 text-xs font-semibold px-4 py-2 rounded-full mb-8 tracking-wider uppercase">
                <MapPin className="w-3.5 h-3.5" /> Carlos Paz · Córdoba · Argentina
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-6">
                HOMA
                <span className="block text-amber-400">Mall</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mb-4 leading-relaxed font-light max-w-2xl">
                El nuevo punto de encuentro comercial de Carlos Paz y la región.
              </p>
              <p className="text-base text-slate-400 mb-12 leading-relaxed max-w-2xl">
                Locales, gastronomía, servicios, promociones y experiencias en un espacio moderno, conectado y pensado para la nueva dinámica del corredor Córdoba–Carlos Paz.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/locales" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-7 py-3.5 rounded-xl transition-colors text-sm">
                  Ver locales <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/promociones" className="inline-flex items-center gap-2 border border-white/20 hover:border-amber-500/50 hover:bg-amber-500/10 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm">
                  Promociones activas
                </Link>
                <Link href="/contacto#alquilar" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/30 text-slate-400 hover:text-white font-medium px-7 py-3.5 rounded-xl transition-colors text-sm">
                  Quiero un local
                </Link>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="relative border-t border-white/8 bg-white/4 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                {[
                  { label: 'Locales comerciales', value: '60+' },
                  { label: 'Rubros disponibles', value: '15+' },
                  { label: 'Km² de superficie', value: '8.000' },
                  { label: 'Años proyectados', value: '2025' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-2xl font-extrabold text-amber-400">{s.value}</div>
                    <div className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── UBICACIÓN ESTRATÉGICA ─────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12">
              <p className="text-amber-600 font-semibold text-sm mb-2 uppercase tracking-wider">Ubicación</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Un mall pensado para una zona en crecimiento
              </h2>
              <p className="text-slate-500 leading-relaxed">
                HOMA Mall se proyecta como un nuevo ecosistema comercial en una ubicación estratégica del corredor Córdoba–Carlos Paz, conectado con una zona de fuerte crecimiento poblacional, turístico y comercial.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TERRITORY_CARDS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="border border-slate-100 rounded-2xl p-6 hover:border-amber-200 hover:shadow-sm transition-all">
                  <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2 text-sm">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CATEGORÍAS ───────────────────────────────────────────────── */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <p className="text-amber-600 font-semibold text-sm mb-2 uppercase tracking-wider">Explorá</p>
              <h2 className="text-3xl font-bold text-slate-900">Todo lo que necesitás, en un solo lugar</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {CATEGORIES.map(({ label, icon: Icon, color, href }) => (
                <Link key={label} href={href} className={`flex flex-col items-center gap-3 p-5 rounded-2xl border ${color} hover:scale-105 transition-transform text-center`}>
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── LOCALES DESTACADOS ────────────────────────────────────────── */}
        {featured.length > 0 && (
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-amber-600 font-semibold text-sm mb-1 uppercase tracking-wider">Nuestros locales</p>
                  <h2 className="text-3xl font-bold text-slate-900">Conocé el ecosistema HOMA</h2>
                </div>
                <Link href="/locales" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors">
                  Ver todos <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map(commerce => <CommerceCard key={commerce.id} commerce={commerce} />)}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link href="/locales" className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600">
                  Ver todos los locales <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── PROMOCIONES ───────────────────────────────────────────────── */}
        {promos.length > 0 && (
          <section className="py-16 bg-amber-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-amber-600 font-semibold text-sm mb-1 uppercase tracking-wider">Ofertas vigentes</p>
                  <h2 className="text-3xl font-bold text-slate-900">Promociones activas</h2>
                </div>
                <Link href="/promociones" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700">
                  Ver todas <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {promos.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-amber-100 p-6 shadow-sm">
                    {p.commerceName && (
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">{p.commerceName}</p>
                    )}
                    <h3 className="font-bold text-slate-900 mb-2">{p.title}</h3>
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{p.description}</p>
                    <p className="text-xs text-slate-400">
                      Válido hasta {new Date(p.endsAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── PARA MARCAS Y COMERCIOS ───────────────────────────────────── */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Store className="w-8 h-8 text-amber-400" />
              </div>
              <p className="text-amber-400 font-semibold text-sm mb-3 uppercase tracking-wider">Para marcas y comercios</p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-5">
                ¿Querés formar parte del ecosistema HOMA?
              </h2>
              <p className="text-slate-400 leading-relaxed mb-10">
                Cada comercio cuenta con ficha pública propia, promociones activas, contacto directo y presencia digital dentro del mall. Formá parte de un nuevo polo comercial estratégico.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contacto#alquilar" className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-3.5 rounded-xl transition-colors">
                  Consultar por un local <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/locales" className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
                  Ver locales actuales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOMA DIGITAL ─────────────────────────────────────────────── */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-amber-600 font-semibold text-sm mb-2 uppercase tracking-wider">Plataforma digital</p>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Un mall con gestión digital desde el primer día
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                HOMA Mall Digital centraliza la comunicación, documentación, promociones y operativa del centro comercial en una sola plataforma.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DIGITAL_FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 p-5 rounded-2xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1 text-sm">{title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── UBICACIÓN Y CONTACTO ─────────────────────────────────────── */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-amber-600 font-semibold text-sm mb-2 uppercase tracking-wider">Visitanos</p>
                <h2 className="text-3xl font-bold text-slate-900 mb-8">Encontranos en Carlos Paz</h2>
                <div className="space-y-5">
                  {[
                    { icon: MapPin, title: 'Dirección', text: 'Av. San Martín 1200, Villa Carlos Paz, Córdoba' },
                    { icon: Clock, title: 'Horario del mall', text: 'Todos los días · 09:00 a 22:00 hs' },
                    { icon: Phone, title: 'Teléfono', text: '+54 9 3541 000000' },
                    { icon: Mail, title: 'Email', text: 'info@homamall.com.ar' },
                    { icon: Globe, title: 'Instagram', text: '@homamalldigital' },
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{title}</div>
                        <div className="text-slate-800 font-medium">{text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex gap-3">
                  <Link href="/contacto" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                    Contactarnos
                  </Link>
                  <Link href="/contacto#alquilar" className="inline-flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                    Quiero un local
                  </Link>
                </div>
              </div>
              <div className="h-72 lg:h-96 bg-slate-200 rounded-2xl overflow-hidden relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26861.69395595793!2d-64.52053!3d-31.4135!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9432985b9b5a8acf%3A0x3c5519e3c0b0c0b0!2sVilla%20Carlos%20Paz%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sar!4v1620000000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </section>

      </main>
      <PublicFooter />
    </div>
  );
}
