import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Commerce } from '@/types';

const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? 'homa_mall';
const COLL = 'comercios';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getCommerces(): Promise<Commerce[]> {
  const snap = await getDocs(collection(db, COLL));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Commerce))
    .filter((c) => c.tenantId === TENANT_ID)
    .sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export async function getCommerceById(id: string): Promise<Commerce | null> {
  const snap = await getDoc(doc(db, COLL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Commerce;
}

export async function getCommerceBySlug(slug: string): Promise<Commerce | null> {
  const all = await getCommerces();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function createCommerce(
  data: Omit<Commerce, 'id' | 'slug' | 'tenantId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const slug = slugify(data.name);
  const ref = await addDoc(collection(db, COLL), {
    ...data,
    slug,
    tenantId: TENANT_ID,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCommerce(
  id: string,
  data: Partial<Omit<Commerce, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COLL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
