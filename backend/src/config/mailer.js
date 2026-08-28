import nodemailer from 'nodemailer';

/**
 * Crea el transporter de correo según variables de entorno o Ethereal (para pruebas)
 */
const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback para entorno de desarrollo: Ethereal Mail
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn('⚠️ No se pudo crear cuenta de prueba Ethereal:', err.message);
    return null;
  }
};

/**
 * Enviar correo de restablecimiento de contraseña
 */
export const sendPasswordResetEmail = async ({ toEmail, userName, resetUrl }) => {
  console.log('\n---------------------------------------------------');
  console.log('📧 ENLACE DE RESTABLECIMIENTO DE CONTRASEÑA:');
  console.log(`Para: ${toEmail}`);
  console.log(`URL: ${resetUrl}`);
  console.log('---------------------------------------------------\n');

  try {
    const transporter = await createTransporter();
    if (!transporter) {
      return { success: true, mode: 'console' };
    }

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f8f6; border-radius: 12px; color: #1c1917;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #e7e5e4;">
          <h1 style="color: #dc2626; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">BODYHEALT</h1>
          <p style="color: #78716c; margin: 5px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Excellence in Fitness & Wellness</p>
        </div>

        <div style="padding: 30px 10px;">
          <h2 style="color: #1c1917; font-size: 22px; margin-top: 0;">Hola, ${userName || 'Usuario'} 👋</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #44403c;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>BodyHealth</strong>.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #44403c;">
            Haz clic en el siguiente botón para ingresar tu nueva contraseña. Este enlace expira en <strong>15 minutos</strong>:
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetUrl}" target="_blank" style="background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: bold; border-radius: 8px; display: inline-block; box-shadow: 0 4px 12px rgba(220,38,38,0.3);">
              Restablecer mi Contraseña
            </a>
          </div>

          <p style="font-size: 14px; color: #78716c; line-height: 1.5;">
            Si el botón no funciona, copia y pega el siguiente enlace en tu navegador web:
          </p>
          <p style="font-size: 13px; color: #dc2626; word-break: break-all; background-color: #ffffff; padding: 10px; border-radius: 6px; border: 1px solid #e7e5e4;">
            ${resetUrl}
          </p>

          <p style="font-size: 14px; color: #78716c; margin-top: 30px;">
            Si tú no solicitaste este cambio, puedes ignorar este correo de forma segura. Tu contraseña seguirá siendo la misma.
          </p>
        </div>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e7e5e4; color: #a8a29e; font-size: 12px;">
          <p>© 2024 BodyHealth Excellence in Fitness. Todos los derechos reservados.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"BodyHealth Soporte" <no-reply@bodyhealth.com>',
      to: toEmail,
      subject: '🔑 Restablece tu contraseña - BodyHealth',
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
    if (previewUrl) {
      console.log('🔗 Previsualización del correo en Ethereal:', previewUrl);
    }

    return { success: true, info, previewUrl };
  } catch (error) {
    console.error('❌ Error enviando correo:', error);
    return { success: false, error: error.message };
  }
};
