import {
  collection, addDoc, getDocs, updateDoc, doc, query, where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { CommercDocument, DocumentStatus } from '@/types';

const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? 'homa_mall';
const COLL = 'legajos';

export const DOCUMENT_TYPES = [
  'Habilitación municipal',
  'Certificado de bomberos',
  'Seguro de responsabilidad civil',
  'Habilitación bromatológica',
  'Inscripción impositiva (AFIP)',
  'Contrato de locación',
  'Reglamento de convivencia',
  'Otro',
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
