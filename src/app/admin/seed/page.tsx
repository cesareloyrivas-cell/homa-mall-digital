'use client';

import { useState } from 'react';
import { Sprout, CheckCircle, Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createCommerce, getCommerces, deleteCommerce } from '@/lib/commerceService';
import { Commerce } from '@/types';

const DEMO_COMMERCES: Array<Omit<Commerce, 'id' | 'slug' | 'tenantId' | 'createdAt' | 'updatedAt'>> = [
  {
    name: 'Café del Lago',
    legalName: 'Del Lago SRL',
    category: 'Gastronomía',
    subcategory: 'Cafetería',
    locationCode: 'A-01',
    description: 'El mejor café de especialidad en Carlos Paz. Desayunos, brunch y meriendas con vista al lago Lago San Roque. Tortas artesanales, croissants y una selección de blends propios.',
    whatsapp: '5493541100001',
    instagram: 'cafedellago',
    email: 'hola@cafedellago.com.ar',
    phone: '3541 100001',
    schedule: 'Lun a Vie: 8:00 a 20:00|Sáb y Dom: 9:00 a 21:00',
    publicStatus: 'destacado',
    internalStatus: 'documentacion_completa',
    documentationStatus: 'completa',
    protectionStatus: 'protegido',
    isFeatured: true,
  },
  {
    name: 'Estilo Urbano',
    legalName: 'Moda Urbana SA',
    category: 'Indumentaria',
    subcategory: 'Ropa casual',
    locationCode: 'B-05',
    description: 'Moda joven y contemporánea para hombre y mujer. Colecciones de temporada, denim premium y accesorios de diseño. Encontrá tu estilo en el corazón del mall.',
    whatsapp: '5493541100002',
    instagram: 'estilourbano_cp',
    schedule: 'Lun a Sáb: 10:00 a 21:00|Dom: 14:00 a 20:00',
    publicStatus: 'verificado',
    internalStatus: 'documentacion_completa',
    documentationStatus: 'completa',
    protectionStatus: 'parcial',
    isFeatured: true,
  },
  {
    name: 'Punto Deco',
    legalName: 'Punto Deco SCR',
    category: 'Hogar y Deco',
    subcategory: 'Decoración',
    locationCode: 'C-12',
    description: 'Artículos de decoración, textiles para el hogar y objetos de diseño argentino. Regalos únicos, velas artesanales, cerámica y mucho más para darle vida a tu espacio.',
    whatsapp: '5493541100003',
    instagram: 'puntodeco',
    email: 'ventas@puntodeco.com',
    schedule: 'Lun a Sáb: 10:00 a 20:00',
    publicStatus: 'publicado',
    internalStatus: 'legajo_iniciado',
    documentationStatus: 'parcial',
    protectionStatus: 'sin_cobertura',
    isFeatured: false,
  },
  {
    name: 'Farma Plus',
    legalName: 'Farmacia Plus SRL',
    category: 'Farmacia',
    subcategory: 'Farmacia y óptica',
    locationCode: 'A-08',
    description: 'Farmacia completa con óptica integrada, perfumería y productos de salud y bienestar. Atención personalizada por profesionales. Turno las 24 hs los fines de semana.',
    whatsapp: '5493541100004',
    instagram: 'farmaplus_cp',
    phone: '3541 100004',
    schedule: 'Lun a Vie: 8:00 a 22:00|Sáb: 9:00 a 22:00|Dom: 10:00 a 21:00',
    publicStatus: 'protegido',
    internalStatus: 'documentacion_completa',
    documentationStatus: 'completa',
    protectionStatus: 'protegido',
    isFeatured: false,
  },
  {
    name: 'Kids Zone',
    legalName: 'Kids Zone Entretenimiento SA',
    category: 'Entretenimiento',
    subcategory: 'Juegos infantiles',
    locationCode: 'D-01',
    description: 'El mejor espacio de entretenimiento para chicos de 2 a 12 años. Cama elástica, laberinto de pelotas, simuladores, karts eléctricos y shows de cumpleaños personalizados.',
    whatsapp: '5493541100005',
    instagram: 'kidszone_homa',
    schedule: 'Lun a Vie: 14:00 a 21:00|Sáb y Dom: 11:00 a 22:00',
    publicStatus: 'verificado',
    internalStatus: 'documentacion_completa',
    documentationStatus: 'completa',
    protectionStatus: 'protegido',
    isFeatured: true,
  },
  {
    name: 'Market Express',
    legalName: 'Market Express SAS',
    category: 'Supermercado',
    subcategory: 'Almacén y despensa',
    locationCode: 'A-02',
    description: 'Supermercado de proximidad con todo lo que necesitás para el día a día. Fiambres y quesos frescos, panadería, frutas y verduras seleccionadas y una amplia bodega.',
    phone: '3541 100006',
    schedule: 'Todos los días: 8:00 a 23:00',
    publicStatus: 'publicado',
    internalStatus: 'alta_iniciada',
    documentationStatus: 'pendiente',
    protectionStatus: 'sin_cobertura',
    isFeatured: false,
  },
  {
    name: 'Tecno Point',
    legalName: 'Tecno Point SA',
    category: 'Tecnología',
    subcategory: 'Electrónica y accesorios',
    locationCode: 'B-10',
    description: 'Celulares, tablets, computadoras y accesorios de las mejores marcas. Service autorizado. Cargamos tu celular de espera. La mejor relación precio-calidad de la región.',
    whatsapp: '5493541100007',
    instagram: 'tecnopoint_cp',
    schedule: 'Lun a Sáb: 10:00 a 21:00|Dom: 15:00 a 20:00',
    publicStatus: 'publicado',
    internalStatus: 'documentacion_parcial',
    documentationStatus: 'parcial',
    protectionStatus: 'sin_cobertura',
    isFeatured: false,
  },
  {
    name: 'Gym Studio',
    legalName: 'GS Fitness SRL',
    category: 'Salud y Bienestar',
    subcategory: 'Gimnasio y fitness',
    locationCode: 'E-01',
    description: 'Centro de entrenamiento funcional, crossfit y yoga. Profesores certificados, equipamiento de última generación, vestuarios con lockers y planes personalizados para todos los niveles.',
    whatsapp: '5493541100008',
    instagram: 'gymstudio_homa',
    email: 'info@gymstudio.ar',
    schedule: 'Lun a Vie: 7:00 a 22:00|Sáb: 8:00 a 20:00|Dom: 9:00 a 14:00',
    publicStatus: 'verificado',
    internalStatus: 'documentacion_completa',
    documentationStatus: 'completa',
    protectionStatus: 'protegido',
    isFeatured: true,
  },
  {
    name: 'Sushi House',
    legalName: 'Sushi House SAS',
    category: 'Gastronomía',
    subcategory: 'Restaurante japonés',
    locationCode: 'C-03',
    description: 'Auténtica cocina japonesa-fusión en el corazón de Carlos Paz. Rolls creativos, sashimi fresco, ramen y una carta de vinos cuidadosamente seleccionada. Delivery y take away disponible.',
    whatsapp: '5493541100009',
    instagram: 'sushihouse_cp',
    schedule: 'Lun a Dom: 12:00 a 16:00 y 19:00 a 23:30',
    publicStatus: 'destacado',
    internalStatus: 'documentacion_completa',
    documentationStatus: 'completa',
    protectionStatus: 'protegido',
    isFeatured: true,
  },
  {
    name: 'Pet Market',
    legalName: 'Pet Market SCR',
    category: 'Servicios',
    subcategory: 'Veterinaria y mascotas',
    locationCode: 'B-14',
    description: 'Todo para tu mascota: alimentos premium, juguetes, ropa, accesorios y servicio de peluquería canina y felina. Veterinaria con turno previo. Tu compañero se lo merece.',
    whatsapp: '5493541100010',
    instagram: 'petmarket_homa',
    email: 'turnos@petmarket.com.ar',
    schedule: 'Lun a Sáb: 9:00 a 20:00|Dom: 10:00 a 17:00',
    publicStatus: 'publicado',
    internalStatus: 'legajo_iniciado',
    documentationStatus: 'parcial',
    protectionStatus: 'sin_cobertura',
    isFeatured: false,
  },
];

type Status = 'idle' | 'seeding' | 'done' | 'error';

export default function SeedPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  function addLog(msg: string) {
    setLog((prev) => [...prev, msg]);
  }

  async function handleSeed() {
    setStatus('seeding');
    setProgress(0);
    setLog([]);

    let created = 0;
    for (const data of DEMO_COMMERCES) {
      try {
        await createCommerce(data);
        created++;
        setProgress(Math.round((created / DEMO_COMMERCES.length) * 100));
        addLog(`✅ ${data.name}`);
      } catch (err) {
        addLog(`❌ ${data.name}: ${err instanceof Error ? err.message : 'Error'}`);
      }
    }

    if (created === DEMO_COMMERCES.length) {
      setStatus('done');
      toast.success(`${created} comercios demo creados correctamente.`);
    } else {
      setStatus('error');
      toast.error(`Se crearon ${created}/${DEMO_COMMERCES.length} comercios.`);
    }
  }

  async function handleDeleteAll() {
    if (!window.confirm('¿Eliminás TODOS los comercios existentes? Esta acción es irreversible.')) return;
    setDeleting(true);
    try {
      const all = await getCommerces();
      for (const c of all) {
        await deleteCommerce(c.id);
      }
      toast.success(`${all.length} comercios eliminados.`);
      setStatus('idle');
      setLog([]);
      setProgress(0);
    } catch {
      toast.error('Error al eliminar los comercios.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Sprout className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Datos de demostración</h1>
          <p className="text-sm text-slate-500">Cargá {DEMO_COMMERCES.length} comercios ficticios para poblar el sitio público.</p>
        </div>
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 mb-6">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold mb-0.5">Solo para entornos de desarrollo</p>
            <p>Esta acción crea comercios reales en Firestore. Usá esta herramienta únicamente para demos o pruebas, no en producción con datos reales de clientes.</p>
          </div>
        </div>
      </div>

      {/* Commerce list preview */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">Comercios que se van a crear</h2>
        <div className="space-y-2">
          {DEMO_COMMERCES.map((c) => (
            <div key={c.name} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <div>
                <span className="text-sm font-medium text-slate-900">{c.name}</span>
                <span className="ml-2 text-xs text-slate-400">· {c.category} · Local {c.locationCode}</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                c.publicStatus === 'destacado' ? 'bg-amber-100 text-amber-700' :
                c.publicStatus === 'verificado' ? 'bg-emerald-100 text-emerald-700' :
                c.publicStatus === 'protegido' ? 'bg-blue-100 text-blue-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {c.publicStatus}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      {status === 'seeding' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Creando comercios...</span>
            <span className="text-sm font-bold text-slate-900">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 max-h-40 overflow-y-auto space-y-1 font-mono text-xs text-slate-600 bg-slate-50 rounded-xl p-3">
            {log.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {status === 'done' && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800">¡Listo! Todos los comercios fueron creados.</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              Podés verlos en <a href="/locales" className="underline font-medium" target="_blank">/locales</a> y en{' '}
              <a href="/admin/comercios" className="underline font-medium">/admin/comercios</a>.
            </p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
          <p className="text-sm font-semibold text-red-700">Hubo errores al crear algunos comercios. Revisá el log.</p>
          <div className="mt-2 max-h-32 overflow-y-auto font-mono text-xs text-slate-600 bg-white rounded-lg p-2">
            {log.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSeed}
          disabled={status === 'seeding' || deleting}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors"
        >
          {status === 'seeding' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</>
          ) : (
            <><Sprout className="w-4 h-4" /> Cargar {DEMO_COMMERCES.length} comercios demo</>
          )}
        </button>
        <button
          onClick={handleDeleteAll}
          disabled={status === 'seeding' || deleting}
          className="flex items-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl disabled:opacity-50 transition-colors border border-red-200"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-xs text-slate-400 text-center mt-2">El botón rojo elimina TODOS los comercios del tenant.</p>
    </div>
  );
}
