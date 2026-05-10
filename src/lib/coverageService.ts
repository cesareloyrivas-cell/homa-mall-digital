import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  serverTimestamp, query, where,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from './firebase';
import { Coverage } from '@/types';

const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? 'homa_mall';
const COLL = 'coberturas';

export const COVERAGE_TYPES = [
  'Seguro contra incendio',
  'Seguro de responsabilidad civil',
  'Seguro de robo y hurto',
  'Seguro de accidentes personales',
  'Seguro de mercadería',
  'ART (Accidentes de Trabajo)',
  'Seguro de cristales',
  'Seguro de equipos electrónicos',
  'Póliza integral de comercio',
  'Otro',
];

export function isCoverageExpiringSoon(expiresAt: string): boolean {
  const exp = new Date(expiresAt);
  const today = new Date();
  const diff = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff < 45;
}

export function getCoverageSemaphore(coverages: Coverage[]): 'verde' | 'amarillo' | 'rojo' {
  if (coverages.length === 0) return 'rojo';
  const hasExpired = coverages.some((c) => c.status === 'vencida');
  const hasPending = coverages.some((c) => c.status === 'pendiente');
  const hasExpiringSoon = coverages.some(
    (c) => c.status !== 'vencida' && isCoverageExpiringSoon(c.expiresAt)
  );
  if (hasExpired || hasPending) return 'rojo';
  if (hasExpiringSoon) return 'amarillo';
  return 'verde';
}

export async function getCoveragesByCommerce(commerceId: string): Promise<Coverage[]> {
  const q = query(
    collection(db, COLL),
    where('tenantId', '==', TENANT_ID),
    where('commerceId', '==', commerceId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coverage));
}

export async function getAllCoverages(): Promise<Coverage[]> {
  const q = query(collection(db, COLL), where('tenantId', '==', TENANT_ID));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coverage));
}

export async function createCoverage(
  data: Omit<Coverage, 'id' | 'tenantId'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLL), {
    ...data,
    tenantId: TENANT_ID,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCoverage(id: string, data: Partial<Coverage>): Promise<void> {
  await updateDoc(doc(db, COLL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function uploadCoverageFile(
  commerceId: string,
  coverageType: string,
  file: File
): Promise<string> {
  const storage = getStorage();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `coberturas/${commerceId}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  const snap = await uploadBytes(storageRef, file);
  return getDownloadURL(snap.ref);
}
