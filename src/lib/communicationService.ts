import {
  collection, addDoc, getDocs, query, where, setDoc, doc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Communication, CommunicationRead } from '@/types';

const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? 'homa_mall';
const COMMS = 'comunicaciones';
const READS = 'comunicaciones_leidas';

export async function getCommunications(): Promise<Communication[]> {
  const snap = await getDocs(collection(db, COMMS));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Communication))
    .filter(c => c.tenantId === TENANT_ID)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCommunicationsForCommerce(
  commerceId: string,
  options: { category?: string; hasIncompleteDocs?: boolean }
): Promise<Communication[]> {
  const all = await getCommunications();
  return all.filter(c => {
    if (c.targetType === 'all') return true;
    if (c.targetType === 'specific') return c.targetCommerceIds?.includes(commerceId);
    if (c.targetType === 'category') return c.targetCategories?.includes(options.category ?? '');
    if (c.targetType === 'pending_docs') return options.hasIncompleteDocs ?? false;
    return false;
  });
}

export async function createCommunication(
  data: Omit<Communication, 'id' | 'tenantId' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COMMS), {
    ...data,
    tenantId: TENANT_ID,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getAllReads(): Promise<CommunicationRead[]> {
  const snap = await getDocs(
    query(collection(db, READS), where('tenantId', '==', TENANT_ID))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunicationRead));
}

export async function getReadsByCommerce(commerceId: string): Promise<CommunicationRead[]> {
  const snap = await getDocs(
    query(
      collection(db, READS),
      where('commerceId', '==', commerceId),
      where('tenantId', '==', TENANT_ID)
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CommunicationRead));
}

export async function markAsRead(
  communicationId: string,
  commerceId: string,
  userId: string
): Promise<void> {
  await setDoc(
    doc(db, READS, `${communicationId}_${commerceId}`),
    { communicationId, commerceId, userId, tenantId: TENANT_ID, readAt: new Date().toISOString() },
    { merge: true }
  );
}

export async function markAsConfirmed(
  communicationId: string,
  commerceId: string,
  userId: string
): Promise<void> {
  await setDoc(
    doc(db, READS, `${communicationId}_${commerceId}`),
    { communicationId, commerceId, userId, tenantId: TENANT_ID, confirmedAt: new Date().toISOString() },
    { merge: true }
  );
}
