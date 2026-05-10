import {
  doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where, serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { AppUser } from '@/types';

const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? 'homa_mall';

export async function getUserById(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'usuarios', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { uid, ...data, role: data.role ?? data.rol } as AppUser;
}

export async function getAllUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, 'usuarios'));
  return snap.docs
    .map(d => ({ uid: d.id, ...d.data() } as AppUser))
    .sort((a, b) => (a.email ?? '').localeCompare(b.email ?? ''));
}

export async function updateUser(uid: string, data: Partial<AppUser>): Promise<void> {
  await updateDoc(doc(db, 'usuarios', uid), { ...data });
}

export async function linkUserToCommerce(uid: string, commerceId: string): Promise<void> {
  const ref = doc(db, 'usuarios', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { commerceId, role: 'propietario_comercio' });
  } else {
    await setDoc(ref, {
      uid, commerceId, role: 'propietario_comercio',
      email: '', displayName: '', isActive: true, createdAt: serverTimestamp(),
    });
  }
}

export async function unlinkUserFromCommerce(uid: string): Promise<void> {
  const ref = doc(db, 'usuarios', uid);
  if ((await getDoc(ref)).exists()) {
    await updateDoc(ref, { commerceId: null });
  }
}
