import {
  collection, doc, addDoc, updateDoc, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Promotion, PromotionStatus } from '@/types';

const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? 'homa_mall';
const COLL = 'promociones';

export async function getPromotions(): Promise<Promotion[]> {
  const snap = await getDocs(collection(db, COLL));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Promotion))
    .filter((p) => p.tenantId === TENANT_ID)
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

export async function getPromotionsByCommerce(commerceId: string): Promise<Promotion[]> {
  const all = await getPromotions();
  return all.filter((p) => p.commerceId === commerceId);
}

export async function getApprovedPromotions(): Promise<Promotion[]> {
  const all = await getPromotions();
  const today = new Date().toISOString().split('T')[0];
  return all.filter((p) => p.status === 'aprobada' && p.endsAt >= today);
}

export async function createPromotion(
  data: Omit<Promotion, 'id' | 'tenantId' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLL), {
    ...data,
    tenantId: TENANT_ID,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePromotion(
  id: string,
  data: Partial<Omit<Promotion, 'id' | 'tenantId' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COLL, id), data);
}

export async function updatePromotionStatus(id: string, status: PromotionStatus): Promise<void> {
  await updateDoc(doc(db, COLL, id), { status });
}
