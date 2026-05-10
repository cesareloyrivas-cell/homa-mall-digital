import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email, commerceId, commerceName } = await req.json() as {
      email: string;
      commerceId: string;
      commerceName: string;
    };

    if (!email || !commerceId || !commerceName) {
      return NextResponse.json({ error: 'Faltan datos requeridos.' }, { status: 400 });
    }

    // 1. Crear usuario en Firebase Auth (sin contraseña — la crea el usuario)
    let uid: string;
    try {
      const existing = await adminAuth.getUserByEmail(email);
      uid = existing.uid;
    } catch {
      const newUser = await adminAuth.createUser({ email });
      uid = newUser.uid;
    }

    // 2. Guardar o actualizar doc en Firestore
    await adminDb.collection('usuarios').doc(uid).set(
      {
        uid,
        email,
        role: 'propietario_comercio',
        commerceId,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // 3. Generar link para que el usuario cree su contraseña
    const resetLink = await adminAuth.generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/login`,
    });

    // 4. Enviar email con Nodemailer + Gmail
    await transporter.sendMail({
      from: `"Mall Digital" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `¡Bienvenido a Mall Digital! Activá tu acceso — ${commerceName}`,
      html: onboardingEmailHtml({ email, commerceName, resetLink }),
    });

    return NextResponse.json({ uid });
  } catch (err: unknown) {
    console.error('Onboarding error:', err);
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function onboardingEmailHtml({
  email,
  commerceName,
  resetLink,
}: {
  email: string;
  commerceName: string;
  resetLink: string;
}) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenido a Mall Digital</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0f172a;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:#f59e0b;border-radius:10px;width:40px;height:40px;text-align:center;vertical-align:middle;">
                    <span style="color:white;font-size:20px;font-weight:bold;line-height:40px;">H</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="color:white;font-size:20px;font-weight:800;letter-spacing:-0.5px;">
                      Mall <span style="color:#f59e0b;">Digital</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">
                ¡Bienvenido a Mall Digital! 🎉
              </h1>
              <p style="margin:0 0 24px;font-size:16px;color:#64748b;line-height:1.6;">
                Tu comercio <strong style="color:#0f172a;">${commerceName}</strong> ya está registrado en el sistema de Mall Digital.
              </p>

              <table cellpadding="0" cellspacing="0" style="background-color:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:32px;width:100%;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">Tu cuenta</p>
                    <p style="margin:0;font-size:15px;color:#78350f;font-weight:600;">${email}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                Para activar tu acceso al panel de gestión, hacé click en el botón de abajo y creá tu contraseña. El link es válido por <strong>24 horas</strong>.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background-color:#f59e0b;border-radius:12px;">
                    <a href="${resetLink}" style="display:inline-block;padding:16px 32px;font-size:16px;font-weight:800;color:#0f172a;text-decoration:none;letter-spacing:-0.3px;">
                      Crear mi contraseña →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:14px;color:#94a3b8;line-height:1.6;">
                Si el botón no funciona, copiá y pegá este link en tu navegador:<br/>
                <a href="${resetLink}" style="color:#f59e0b;word-break:break-all;font-size:13px;">${resetLink}</a>
              </p>

              <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;" />

              <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
                Una vez que actives tu cuenta podés acceder desde
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/login" style="color:#f59e0b;">homamall.com.ar/login</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                © ${new Date().getFullYear()} Mall Digital<br/>
                Si no esperabas este email, podés ignorarlo.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
