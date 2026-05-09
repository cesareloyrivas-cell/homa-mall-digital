'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Completá todos los campos.');
      return;
    }
    setSubmitting(true);
    try {
      // 1. Autenticar con Firebase
      const cred = await signInWithEmailAndPassword(auth, email, password);

      // 2. Obtener rol desde Firestore
      let role = 'propietario_comercio';
      try {
        const snap = await getDoc(doc(db, 'usuarios', cred.user.uid));
        if (snap.exists()) {
          const data = snap.data();
          role = data.role ?? data.rol ?? role;
        }
      } catch {
        // Si Firestore falla, redirigir al panel comercio por defecto
      }

      sessionStorage.setItem('homa_role', role);
      toast.success('¡Bienvenido!');

      // 3. Redirigir según rol
      if (role === 'admin_mall' || role === 'super_admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/comercio';
      }

    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        toast.error('Email o contraseña incorrectos.');
      } else if (code === 'auth/too-many-requests') {
        toast.error('Demasiados intentos. Esperá unos minutos.');
      } else {
        toast.error(`Error: ${code ?? 'desconocido'}`);
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-base">
            HOMA <span className="text-amber-400">Mall</span>
          </span>
        </Link>
        <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Volver al sitio
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Acceso privado</h1>
            <p className="text-slate-400 text-sm">
              Ingresá con tus credenciales para acceder al panel de gestión.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-bold rounded-xl transition-colors text-sm mt-2"
            >
              {submitting ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-8">
            ¿No tenés acceso?{' '}
            <a href="mailto:info@homamall.com.ar" className="text-amber-400 hover:text-amber-300">
              Contactá a la administración
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
