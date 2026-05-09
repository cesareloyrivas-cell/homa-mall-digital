'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { AppUser, UserRole } from '@/types';

interface AuthContextValue {
  firebaseUser: User | null;
  usuario: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const snap = await getDoc(doc(db, 'usuarios', fbUser.uid));
          if (snap.exists()) {
            const data = snap.data();
            setUsuario({ uid: fbUser.uid, ...data, role: data.role ?? data.rol } as AppUser);
          } else {
            // Doc not in Firestore yet — keep the user logged in with a safe default
            setUsuario({ uid: fbUser.uid, email: fbUser.email ?? '', role: 'propietario_comercio' } as AppUser);
          }
        } catch {
          // Firestore rules may be blocking — don't log out, use cached role if available
          const cachedRole = sessionStorage.getItem('homa_role') as AppUser['role'] | null;
          setUsuario({ uid: fbUser.uid, email: fbUser.email ?? '', role: cachedRole ?? 'propietario_comercio' } as AppUser);
        }
      } else {
        setUsuario(null);
        sessionStorage.removeItem('homa_role');
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUsuario(null);
  };

  const isRole = (...roles: UserRole[]) =>
    !!usuario && roles.includes(usuario.role);

  return (
    <AuthContext.Provider value={{ firebaseUser, usuario, loading, signIn, signOut, isRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
