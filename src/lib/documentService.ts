import {
  collection, addDoc, getDocs, updateDoc, doc, query, where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { CommercDocument, DocumentStatus } from '@/types';

const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? 'homa_mall';
const COLL = 'legajos';

// Base documents required for ALL commerces
export const DOCUMENT_TYPES_BASE = [
  'Habilitación municipal',
  'Inscripción impositiva (AFIP)',
  'Contrato de locación',
  'Reglamento de convivencia',
  'Certificado de bomberos',
  'Otro',
];

// Additional documents by business model category
export const DOCUMENT_TYPES_BY_CATEGORY: Record<string, string[]> = {
  gastronomia: [
    'Habilitación bromatológica',
    'Carnet de manipulador de alimentos',
    'Libreta sanitaria del personal',
    'Plan de análisis de peligros (HACCP)',
    'Registro de libro de inspecciones',
  ],
  salud_estetica: [
    'Habilitación sanitaria',
    'Título/matrícula profesional',
    'Registro de productos cosméticos (ANMAT)',
    'Libro de inspecciones sanitarias',
  ],
  entretenimiento: [
    'Habilitación de esparcimiento',
    'Certificado de capacidad máxima',
    'Seguro de accidentes a terceros',
    'Plan de evacuación aprobado',
  ],
  tecnologia: [
    'Garantía de servicio técnico',
    'Registro de importador (si aplica)',
  ],
  indumentaria: [
    'Registro de habilitación comercial',
  ],
  productos: [
    'Permiso de expendio',
    'Registro de proveedor habilitado',
  ],
  servicios_profesionales: [
    'Matrícula o habilitación profesional',
    'Seguro de mala praxis (si aplica)',
  ],
};

export function getDocumentTypesForCategory(category: string): string[] {
  // Dynamic import avoided — use direct mapping
  const modelMap: Record<string, string> = {
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
  };
  const model = modelMap[category];
  const extra = model ? (DOCUMENT_TYPES_BY_CATEGORY[model] ?? []) : [];
  return [...DOCUMENT_TYPES_BASE, ...extra];
}

// Legacy flat list (used in admin add-requirement dropdown)
export const DOCUMENT_TYPES = [
  ...DOCUMENT_TYPES_BASE,
  'Habilitación bromatológica',
  'Carnet de manipulador de alimentos',
  'Libreta sanitaria del personal',
  'Habilitación sanitaria',
  'Título/matrícula profesional',
  'Habilitación de esparcimiento',
  'Certificado de capacidad máxima',
  'Matrícula o habilitación profesional',
];

export async function getDocumentsByCommerce(commerceId: string): Promise<CommercDocument[]> {
  const snap = await getDocs(
    query(collection(db, COLL), where('commerceId', '==', commerceId), where('tenantId', '==', TENANT_ID))
  );
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as CommercDocument))
    .sort((a, b) => a.type.localeCompare(b.type));
}

export async function getAllDocuments(): Promise<CommercDocument[]> {
  const snap = await getDocs(collection(db, COLL));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as CommercDocument))
    .filter(d => d.tenantId === TENANT_ID);
}

export async function createDocument(
  data: Omit<CommercDocument, 'id' | 'tenantId' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLL), {
    ...data,
    tenantId: TENANT_ID,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateDocument(
  id: string,
  data: Partial<Omit<CommercDocument, 'id' | 'tenantId' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COLL, id), data);
}

export async function uploadDocumentFile(
  commerceId: string,
  docType: string,
  file: File
): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const safeType = docType.replace(/[^a-zA-Z0-9]/g, '_');
  const storageRef = ref(storage, `legajos/${commerceId}/${safeType}/${timestamp}_${safeName}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export type Semaphore = 'verde' | 'amarillo' | 'rojo';

export function getDocumentSemaphore(docs: CommercDocument[]): Semaphore {
  if (docs.length === 0) return 'rojo';
  if (docs.some(d => d.status === 'pendiente' || d.status === 'vencido')) return 'rojo';
  if (docs.some(d => d.status === 'presentado' || d.status === 'observado')) return 'amarillo';
  return 'verde';
}

export function isExpiringSoon(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
}
