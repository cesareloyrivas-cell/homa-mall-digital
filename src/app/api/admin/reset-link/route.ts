import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const { email, uid, disabled } = await req.json() as {
      email?: string;
      uid?: string;
      disabled?: boolean;
    };

    // Activar / desactivar usuario
    if (uid !== undefined && disabled !== undefined) {
      await adminAuth.updateUser(uid, { disabled });
      await adminDb.collection('usuarios').doc(uid).set(
        { isActive: !disabled, updatedAt: FieldValue.serverTimestamp() },
        { merge: true }
      );
      return NextResponse.json({ ok: true });
    }

    // Generar link de contraseña
    if (!email) {
      return NextResponse.json({ error: 'Email requerido.' }, { status: 400 });
    }

    const resetLink = await adminAuth.generatePasswordResetLink(email, {
      url: `${APP_URL}/login`,
    });

    return NextResponse.json({ resetLink });
  } catch (err: unknown) {
    console.error('reset-link error:', err);
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
