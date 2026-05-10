'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Clock, MessageCircle, Globe, Mail, Phone,
  ArrowLeft, Star, ShieldCheck, BadgeCheck, Flame, Tag, Calendar, AlertCircle,
} from 'lucide-react';
import { getCommerceBySlug } from '@/lib/commerceService';
import { getPromotionsByCommerce } from '@/lib/promotionService';
import { Commerce, Promotion, PublicStatus } from '@/types';

const STATUS_CONFIG: Record<PublicStatus, { label: string; color: string; icon: typeof Star } | null> = {
  destacado: { label: 'Comercio Destacado', color: 'bg-amber-500 text-white', icon: Flame },
  verificado: { label: 'Comercio Verificado', color: 'bg-emerald-500 text-white', icon: BadgeCheck },
  protegido: { label: 'Comercio Protegido', color: 'bg-blue-500 text-white', icon: ShieldCheck },
  publicado: { label: 'Publicado', color: 'bg-slate-200 text-slate-700', icon: Star },
  no_publicado: null,
};

export default function CommerceDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [commerce, setCommerce] = useState<Commerce | null | undefined>(undefined);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    getCommerceBySlug(slug).then((c) => {
      if (!c || c.publicStatus === 'no_publicado') {
        setCommerce(null);
      } else {
        setCommerce(c);
        const today = new Date().toISOString().split('T')[0];
        getPromotionsByCommerce(c.id).then((all) =>
          setPromotions(all.filter(p => p.status === 'aprobada' && p.endsAt >= today))
        );
      }
    });
  }, [slug]);

  if (commerce === undefined) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (commerce === null) {
    notFound();
  }

  const statusConf = STATUS_CONFIG[commerce.publicStatus];
  const initials = commerce.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/locales"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-amber-600 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a locales
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
              {commerce.logoUrl ? (
                <img src={commerce.logoUrl} alt={commerce.name} className="h-full w-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-900 flex items-center justify-center shadow-md">
                  <span className="text-3xl font-bold text-amber-400">{initials}</span>
                </div>
              )}
              {statusConf && (
                <div
                  className={`absolute top-4 right-4 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${statusConf.color}`}
                >
                  <statusConf.icon className="w-3.5 h-3.5" />
                  {statusConf.label}
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{commerce.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-amber-600 font-medium">{commerce.category}</span>
                    {commerce.subcategory && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="text-sm text-slate-500">{commerce.subcategory}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {commerce.description && (
                <p className="text-slate-600 leading-relaxed text-sm">{commerce.description}</p>
              )}
            </div>
          </div>

          {promotions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-amber-500" /> Promociones activas
              </h2>
              <div className="space-y-4">
                {promotions.map((promo) => (
                  <div key={promo.id} className="border border-amber-100 bg-amber-50 rounded-xl p-4">
                    <div className="font-semibold text-slate-900 mb-1">{promo.title}</div>
                    <p className="text-sm text-slate-600 mb-2">{promo.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      Válido hasta {new Date(promo.endsAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
                    </div>
                    {promo.conditions && (
                      <p className="text-xs text-slate-400 italic mt-1">* {promo.conditions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(commerce.photos?.length ?? 0) > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-semibold text-slate-900 mb-4">Galería</h2>
              <div className="grid grid-cols-3 gap-2">
                {commerce.photos!.map((url, i) => (
                  <img key={i} src={url} alt="" className="rounded-xl h-24 w-full object-cover" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {commerce.schedule && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Horario
              </h2>
              <div className="text-sm text-slate-600 leading-relaxed">
                {commerce.schedule.split('|').map((s, i) => (
                  <p key={i}>{s.trim()}</p>
                ))}
              </div>
            </div>
          )}

          {commerce.locationCode && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" /> Ubicación en el mall
              </h2>
              <div className="text-sm text-slate-600">
                Local <span className="font-bold text-slate-900">{commerce.locationCode}</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-semibold text-slate-900 mb-4">Contacto</h2>
            <div className="space-y-3">
              {commerce.whatsapp && (
                <a
                  href={`https://wa.me/${commerce.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 shrink-0" />
                  Escribir por WhatsApp
                </a>
              )}
              {commerce.instagram && (
                <a
                  href={`https://instagram.com/${commerce.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-pink-50 border border-pink-100 text-pink-700 rounded-xl text-sm font-medium hover:bg-pink-100 transition-colors"
                >
                  <Globe className="w-5 h-5 shrink-0" />
                  @{commerce.instagram}
                </a>
              )}
              {commerce.email && (
                <a
                  href={`mailto:${commerce.email}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
                >
                  <Mail className="w-5 h-5 shrink-0" />
                  {commerce.email}
                </a>
              )}
              {commerce.phone && (
                <a
                  href={`tel:${commerce.phone}`}
                  className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
                >
                  <Phone className="w-5 h-5 shrink-0" />
                  {commerce.phone}
                </a>
              )}
            </div>
          </div>

          {(commerce.publicStatus === 'protegido' || commerce.publicStatus === 'verificado') && (
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <ShieldCheck className="w-4 h-4" />
                {commerce.publicStatus === 'protegido' ? 'Comercio protegido' : 'Comercio verificado'}
              </div>
              <p className="text-xs text-blue-600 leading-relaxed">
                {commerce.publicStatus === 'protegido'
                  ? 'Este comercio tiene su documentación y coberturas informadas al día.'
                  : 'Este comercio ha sido verificado por la administración de Mall Digital.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
