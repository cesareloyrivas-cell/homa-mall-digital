'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Clock, Phone, Star, ShieldCheck, BadgeCheck, Sparkles } from 'lucide-react';
import { getCommerces } from '@/lib/commerceService';
import { Commerce } from '@/types';
import CommerceCard from '@/components/ui/CommerceCard';
import PublicNavbar from '@/components/layout/PublicNavbar';
import PublicFooter from '@/components/layout/PublicFooter';

export default function HomePage() {
  const [featured, setFeatured] = useState<Commerce[]>([]);

  useEffect(() => {
    getCommerces().then((all) => {
      const highlights = all
        .filter((c) => c.isFeatured && c.publicStatus !== 'no_publicado')
        .slice(0, 3);
      // fallback: show any published commerce if no featured ones
      if (highlights.length === 0) {
        setFeatured(all.filter((c) => c.publicStatus !== 'no_publicado').slice(0, 3));
      } else {
        setFeatured(highlights);
      }
    });
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900/30" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                Carlos Paz, Córdoba
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                El corazón comercial de{' '}
                <span className="text-amber-400">Carlos Paz</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed">
                Más de 60 locales comerciales, gastronomía, entretenimiento y servicios en un solo espacio moderno y ordenado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/locales"
                  className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-8 py-3.5 rounded-xl transition-colors text-base"
                >
                  Ver todos los locales <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/promociones"
                  className="inline-flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
                >
                  Ver promociones
                </Link>
              </div>
            </div>
          </div>
          <div className="relative border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                {[
                  { label: 'Locales', value: '60+' },
                  { label: 'Rubros', value: '15+' },
                  { label: 'Promociones activas', value: '12' },
                  { label: 'Años en la ciudad', value: '5' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl font-bold text-amber-400">{s.value}</div>
                    <div className="text-sm text-slate-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Locales destacados */}
        {featured.length > 0 && (
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-amber-600 font-semibold text-sm mb-1 uppercase tracking-wider">Destacados</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Locales del mall</h2>
                </div>
                <Link
                  href="/locales"
                  className="hidden sm:flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                >
                  Ver todos <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map((commerce) => (
                  <CommerceCard key={commerce.id} commerce={commerce} />
                ))}
              </div>
              <div className="mt-8 text-center sm:hidden">
                <Link href="/locales" className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700">
                  Ver todos los locales <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Por qué HOMA */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                Todo lo que necesitás, en un solo lugar
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                HOMA Mall reúne los mejores comercios de Carlos Paz con la experiencia de compra que merecés.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { icon: Star, title: 'Comercios verificados', desc: 'Todos los locales pasan por un proceso de verificación para garantizar calidad y seriedad.' },
                { icon: ShieldCheck, title: 'Comercios protegidos', desc: 'Los negocios con cobertura activa y documentación al día están identificados como protegidos.' },
                { icon: BadgeCheck, title: 'Información actualizada', desc: 'Horarios, contactos y promociones actualizados directamente por cada comercio.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center p-6">
                  <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-amber-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cómo llegar */}
        <section className="py-16 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-amber-400 font-semibold text-sm mb-2 uppercase tracking-wider">Ubicación</p>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">Encontranos fácil en Carlos Paz</h2>
                <div className="space-y-4">
                  {[
                    { icon: MapPin, title: 'Dirección', text: 'Av. San Martín 1200, Carlos Paz, Córdoba' },
                    { icon: Clock, title: 'Horario del mall', text: 'Lunes a Domingo · 09:00 a 22:00 hs' },
                    { icon: Phone, title: 'Contacto', text: '+54 9 3541 000000' },
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{title}</div>
                        <div className="text-slate-400 text-sm">{text}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex gap-4">
                  <Link href="/contacto" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold px-6 py-3 rounded-xl transition-colors text-sm">
                    Contactarnos
                  </Link>
                  <Link href="/contacto#alquilar" className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                    Quiero un local
                  </Link>
                </div>
              </div>
              <div className="h-64 lg:h-80 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <MapPin className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">Mapa interactivo</p>
                  <p className="text-xs text-slate-600">Av. San Martín 1200, Carlos Paz</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
