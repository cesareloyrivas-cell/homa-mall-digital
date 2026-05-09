import Link from 'next/link';
import { ShoppingBag, MapPin, Phone, Mail, Globe } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">
                HOMA <span className="text-amber-400">Mall</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              El centro comercial más moderno de Carlos Paz. Más de 60 locales, gastronomía, entretenimiento y servicios.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/', label: 'Inicio' },
                { href: '/locales', label: 'Nuestros locales' },
                { href: '/promociones', label: 'Promociones' },
                { href: '/contacto', label: 'Contacto' },
                { href: '/login', label: 'Acceso privado' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-amber-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span>Av. San Martín 1200, Carlos Paz, Córdoba</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="tel:+5493541000000" className="hover:text-amber-400 transition-colors">
                  +54 9 3541 000000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href="mailto:info@homamall.com.ar" className="hover:text-amber-400 transition-colors">
                  info@homamall.com.ar
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href="https://instagram.com/homamall"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors"
                >
                  @homamall
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} HOMA Mall. Todos los derechos reservados.</span>
          <span>Plataforma digital desarrollada con MallOS</span>
        </div>
      </div>
    </footer>
  );
}
