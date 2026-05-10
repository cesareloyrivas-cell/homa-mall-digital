import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const TENANT_ID = process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID ?? 'homa_mall';

export async function POST(req: NextRequest) {
  try {
    const { email, displayName, role, commerceId } = await req.json() as {
      email: string;
      displayName?: string;
      role: string;
      commerceId?: string;
    };

    if (!email || !role) {
      return NextResponse.json({ error: 'Email y rol son obligatorios.' }, { status: 400 });
    }

    // Crear o recuperar usuario en Firebase Auth
    let uid: string;
    try {
      const existing = await adminAuth.getUserByEmail(email);
      uid = existing.uid;
      if (displayName) await adminAuth.updateUser(uid, { displayName });
    } catch {
      const newUser = await adminAuth.createUser({ email, displayName: displayName || undefined });
      uid = newUser.uid;
    }

    // Crear/actualizar doc en Firestore
    await adminDb.collection('usuarios').doc(uid).set(
      {
        uid, email,
        displayName: displayName || '',
        role,
        tenantId: TENANT_ID,
        ...(commerceId ? { commerceId } : {}),
        isActive: true,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Generar link de contraseña
    const resetLink = await adminAuth.generatePasswordResetLink(email, {
      url: `${APP_URL}/login`,
    });

    return NextResponse.json({ uid, resetLink });
  } catch (err: unknown) {
    console.error('create-user error:', err);
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
