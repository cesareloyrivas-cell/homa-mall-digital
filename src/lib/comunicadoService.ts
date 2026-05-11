import {
  collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where,
} from 'firebase/firestore';
import { db } from './firebase';
import { Communication } from '@/types';

const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? 'homa_mall';
const COLL = 'comunicados';

// ─── Admin: todas las comunicaciones ─────────────────────────────────────────

export async function getAllComunicados(): Promise<Communication[]> {
  const snap = await getDocs(
    query(collection(db, COLL), where('tenantId', '==', TENANT_ID))
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Communication))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ─── Comercio: solo las publicadas y vigentes que le corresponden ─────────────

export async function getComunicadosForCommerce(
  commerceId: string,
  category?: string,
): Promise<Communication[]> {
  const now = new Date().toISOString();
  const snap = await getDocs(
    query(
      collection(db, COLL),
      where('tenantId', '==', TENANT_ID),
      where('status', '==', 'publicado'),
    )
  );
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Communication));

  return all
    .filter((c) => {
      // Excluir si ya venció
      if (c.expiresAt && c.expiresAt < now) return false;
      // Filtrar por targetType
      if (c.targetType === 'all') return true;
      if (c.targetType === 'category' && category && c.targetCategories?.includes(category)) return true;
      if (c.targetType === 'specific' && c.targetCommerceIds?.includes(commerceId)) return true;
      return false;
    })
    .sort((a, b) => {
      // Críticas primero, luego por fecha descendente
      const priorityOrder = { critica: 0, alta: 1, media: 2, baja: 3 };
      const pa = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const pb = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
      if (pa !== pb) return pa - pb;
      return (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt);
    });
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createComunicado(
  data: Omit<Communication, 'id'>
): Promise<string> {
  const docRef = await addDoc(collection(db, COLL), {
    ...data,
    tenantId: TENANT_ID,
  });
  return docRef.id;
}

export async function updateComunicado(
  id: string,
  data: Partial<Omit<Communication, 'id'>>,
): Promise<void> {
  await updateDoc(doc(db, COLL, id), data);
}

export async function deleteComunicado(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL, id));
}

export async function publishComunicado(id: string): Promise<void> {
  await updateDoc(doc(db, COLL, id), {
    status: 'publicado',
    publishedAt: new Date().toISOString(),
  });
}

export async function archiveComunicado(id: string): Promise<void> {
  await updateDoc(doc(db, COLL, id), { status: 'archivado' });
}
