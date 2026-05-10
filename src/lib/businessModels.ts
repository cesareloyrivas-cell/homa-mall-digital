/**
 * Business model classification for commerce categories.
 * Each model unlocks specific sidebar links and dashboard widgets.
 */

export type BusinessModel =
  | 'gastronomia'
  | 'indumentaria'
  | 'salud_estetica'
  | 'tecnologia'
  | 'entretenimiento'
  | 'servicios_profesionales'
  | 'productos'
  | 'general';

export const CATEGORY_TO_MODEL: Record<string, BusinessModel> = {
  'Gastronomía': 'gastronomia',
  'Indumentaria': 'indumentaria',
  'Calzado': 'indumentaria',
  'Joyería y Accesorios': 'indumentaria',
  'Salud y Bienestar': 'salud_estetica',
  'Belleza y Estética': 'salud_estetica',
  'Farmacia': 'salud_estetica',
  'Tecnología': 'tecnologia',
  'Entretenimiento': 'entretenimiento',
  'Servicios': 'servicios_profesionales',
  'Librería y Papelería': 'servicios_profesionales',
  'Hogar y Deco': 'productos',
  'Supermercado': 'productos',
  'Deportes': 'productos',
  'Otro': 'general',
};

export function getBusinessModel(category: string): BusinessModel {
  return CATEGORY_TO_MODEL[category] ?? 'general';
}

export interface ModelConfig {
  label: string;
  emoji: string;
  color: string;
  description: string;
  dashboardWidgets: DashboardWidget[];
}

export interface DashboardWidget {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

export const MODEL_CONFIGS: Record<BusinessModel, ModelConfig> = {
  gastronomia: {
    label: 'Gastronomía',
    emoji: '🍽️',
    color: 'from-orange-50 to-amber-50',
    description: 'Gestión para restaurantes, cafeterías y bares',
    dashboardWidgets: [
      { id: 'menu', title: 'Carta / Menú', description: 'Actualizá tu oferta gastronómica', icon: '📋', href: '/comercio/productos', color: 'bg-orange-100 text-orange-700' },
      { id: 'horarios', title: 'Horarios', description: 'Gestioná tu disponibilidad', icon: '🕐', href: '/comercio/ficha', color: 'bg-amber-100 text-amber-700' },
      { id: 'promociones', title: 'Promociones', description: 'Lanzá ofertas especiales', icon: '🏷️', href: '/comercio/promociones', color: 'bg-yellow-100 text-yellow-700' },
      { id: 'whatsapp', title: 'Pedidos por WhatsApp', description: 'Configurá tu canal de pedidos', icon: '💬', href: '/comercio/ficha', color: 'bg-emerald-100 text-emerald-700' },
    ],
  },
  indumentaria: {
    label: 'Indumentaria y Moda',
    emoji: '👗',
    color: 'from-purple-50 to-pink-50',
    description: 'Gestión para ropa, calzado y accesorios',
    dashboardWidgets: [
      { id: 'coleccion', title: 'Colección', description: 'Mostrá tu oferta de temporada', icon: '👔', href: '/comercio/productos', color: 'bg-purple-100 text-purple-700' },
      { id: 'fotos', title: 'Galería de productos', description: 'Subí fotos de tu local', icon: '📸', href: '/comercio/ficha', color: 'bg-pink-100 text-pink-700' },
      { id: 'promociones', title: 'Liquidaciones', description: 'Promociones y descuentos', icon: '🏷️', href: '/comercio/promociones', color: 'bg-rose-100 text-rose-700' },
      { id: 'instagram', title: 'Instagram', description: 'Enlazá tu perfil de moda', icon: '📷', href: '/comercio/ficha', color: 'bg-fuchsia-100 text-fuchsia-700' },
    ],
  },
  salud_estetica: {
    label: 'Salud y Estética',
    emoji: '💆',
    color: 'from-teal-50 to-cyan-50',
    description: 'Gestión para salud, bienestar y belleza',
    dashboardWidgets: [
      { id: 'servicios', title: 'Servicios', description: 'Listá tus tratamientos y servicios', icon: '✨', href: '/comercio/productos', color: 'bg-teal-100 text-teal-700' },
      { id: 'turnos', title: 'Turnos', description: 'Informá cómo reservar turno', icon: '📅', href: '/comercio/ficha', color: 'bg-cyan-100 text-cyan-700' },
      { id: 'equipo', title: 'Profesionales', description: 'Presentá tu equipo', icon: '👩‍⚕️', href: '/comercio/ficha', color: 'bg-blue-100 text-blue-700' },
      { id: 'promociones', title: 'Packs y ofertas', description: 'Promociones especiales', icon: '💎', href: '/comercio/promociones', color: 'bg-indigo-100 text-indigo-700' },
    ],
  },
  tecnologia: {
    label: 'Tecnología',
    emoji: '💻',
    color: 'from-blue-50 to-slate-50',
    description: 'Gestión para electrónica y servicios técnicos',
    dashboardWidgets: [
      { id: 'catalogo', title: 'Catálogo', description: 'Productos y equipos disponibles', icon: '🖥️', href: '/comercio/productos', color: 'bg-blue-100 text-blue-700' },
      { id: 'servicio', title: 'Service', description: 'Reparaciones y garantías', icon: '🔧', href: '/comercio/ficha', color: 'bg-slate-100 text-slate-700' },
      { id: 'marcas', title: 'Marcas', description: 'Mostrá con qué marcas trabajás', icon: '🏷️', href: '/comercio/ficha', color: 'bg-indigo-100 text-indigo-700' },
      { id: 'promociones', title: 'Ofertas tech', description: 'Descuentos y financiación', icon: '💰', href: '/comercio/promociones', color: 'bg-sky-100 text-sky-700' },
    ],
  },
  entretenimiento: {
    label: 'Entretenimiento',
    emoji: '🎡',
    color: 'from-yellow-50 to-lime-50',
    description: 'Gestión para espacios de entretenimiento',
    dashboardWidgets: [
      { id: 'actividades', title: 'Actividades', description: 'Qué experiencias ofrecés', icon: '🎮', href: '/comercio/productos', color: 'bg-yellow-100 text-yellow-700' },
      { id: 'eventos', title: 'Eventos y shows', description: 'Próximas fechas especiales', icon: '🎉', href: '/comercio/promociones', color: 'bg-lime-100 text-lime-700' },
      { id: 'cumples', title: 'Cumpleaños', description: 'Paquetes especiales', icon: '🎂', href: '/comercio/ficha', color: 'bg-green-100 text-green-700' },
      { id: 'tarifas', title: 'Tarifas', description: 'Precios y bonos de tiempo', icon: '🎟️', href: '/comercio/ficha', color: 'bg-emerald-100 text-emerald-700' },
    ],
  },
  servicios_profesionales: {
    label: 'Servicios Profesionales',
    emoji: '💼',
    color: 'from-slate-50 to-zinc-50',
    description: 'Gestión para servicios y asesoramiento profesional',
    dashboardWidgets: [
      { id: 'servicios', title: 'Servicios', description: 'Qué servicios brindás', icon: '🧾', href: '/comercio/productos', color: 'bg-slate-100 text-slate-700' },
      { id: 'contacto', title: 'Contacto', description: 'Cómo se comunican con vos', icon: '📞', href: '/comercio/ficha', color: 'bg-zinc-100 text-zinc-700' },
      { id: 'horarios', title: 'Horarios', description: 'Tu disponibilidad', icon: '📆', href: '/comercio/ficha', color: 'bg-stone-100 text-stone-700' },
      { id: 'promociones', title: 'Novedades', description: 'Ofertas y actualizaciones', icon: '📢', href: '/comercio/promociones', color: 'bg-amber-100 text-amber-700' },
    ],
  },
  productos: {
    label: 'Comercio de Productos',
    emoji: '🛍️',
    color: 'from-amber-50 to-orange-50',
    description: 'Gestión para tiendas y comercios de venta de productos',
    dashboardWidgets: [
      { id: 'catalogo', title: 'Catálogo', description: 'Productos y stock disponible', icon: '📦', href: '/comercio/productos', color: 'bg-amber-100 text-amber-700' },
      { id: 'ofertas', title: 'Ofertas', description: 'Descuentos y promociones', icon: '🏷️', href: '/comercio/promociones', color: 'bg-orange-100 text-orange-700' },
      { id: 'contacto', title: 'Contacto', description: 'WhatsApp y redes sociales', icon: '📲', href: '/comercio/ficha', color: 'bg-yellow-100 text-yellow-700' },
      { id: 'horarios', title: 'Horarios', description: 'Atención al público', icon: '🕐', href: '/comercio/ficha', color: 'bg-lime-100 text-lime-700' },
    ],
  },
  general: {
    label: 'Comercio',
    emoji: '🏪',
    color: 'from-slate-50 to-slate-100',
    description: 'Panel general de comercio',
    dashboardWidgets: [
      { id: 'ficha', title: 'Mi Ficha', description: 'Editá tu info pública', icon: '🏪', href: '/comercio/ficha', color: 'bg-slate-100 text-slate-700' },
      { id: 'promociones', title: 'Promociones', description: 'Creá ofertas', icon: '🏷️', href: '/comercio/promociones', color: 'bg-amber-100 text-amber-700' },
      { id: 'comunicados', title: 'Comunicados', description: 'Mensajes del mall', icon: '📢', href: '/comercio/comunicados', color: 'bg-blue-100 text-blue-700' },
      { id: 'documentacion', title: 'Documentación', description: 'Legajo digital', icon: '📁', href: '/comercio/documentacion', color: 'bg-emerald-100 text-emerald-700' },
    ],
  },
};
