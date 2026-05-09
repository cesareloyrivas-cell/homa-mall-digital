import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { AppUser } from '@/types';

export async function getUserById(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'usuarios', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { uid, ...data, role: data.role ?? data.rol } as AppUser;
}

export async function linkUserToCommerce(uid: string, commerceId: string): Promise<void> {
  const ref = doc(db, 'usuarios', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { commerceId, role: 'propietario_comercio' });
  } else {
    await setDoc(ref, {
      uid,
      commerceId,
      role: 'propietario_comercio',
      email: '',
      displayName: '',
      createdAt: serverTimestamp(),
    });
  }
}

export async function unlinkUserFromCommerce(uid: string): Promise<void> {
  const ref = doc(db, 'usuarios', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { commerceId: null });
  }
}
