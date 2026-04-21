type PasswordRecoveryEmailParams = {
  temporaryPassword: string;
  userName: string;
};

export const passwordRecoveryEmail = ({ temporaryPassword, userName }: PasswordRecoveryEmailParams) => `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Recuperar contrasena</title>
    </head>
    <body style="margin:0;padding:0;background-color:#fff7f0;font-family:Arial,Helvetica,sans-serif;color:#1b1b1b;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(180deg,#fff7f0 0%,#ffffff 100%);padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #ffd4b3;">
              <tr>
                <td style="background:#111111;padding:36px 40px;text-align:center;">
                  <div style="font-size:24px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#ffffff;">
                    Preguntas <span style="color:#ff7a00;">Frecuentes</span>
                  </div>
                  <div style="margin-top:10px;font-size:14px;line-height:22px;color:#ffd9bd;">
                    Recupero seguro de contrasena
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:40px;">
                  <div style="display:inline-block;background:#fff1e6;color:#ff7a00;border-radius:999px;padding:8px 14px;font-size:12px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;">
                    Recuperacion de acceso
                  </div>
                  <h1 style="margin:20px 0 12px;font-size:30px;line-height:36px;color:#111111;">
                    Hola ${userName},
                  </h1>
                  <p style="margin:0 0 16px;font-size:16px;line-height:26px;color:#4a4a4a;">
                    Recibimos una solicitud para recuperar la contrasena de tu cuenta en SIGEPA.
                  </p>
                  <p style="margin:0 0 28px;font-size:16px;line-height:26px;color:#4a4a4a;">
                    Generamos una nueva contrasena temporal para que puedas volver a ingresar y luego cambiarla desde tu perfil.
                  </p>
                  <div style="padding:18px 20px;border-radius:16px;background:#fff7f0;border:1px solid #ffd4b3;">
                    <p style="margin:0 0 12px;font-size:14px;line-height:22px;color:#4a4a4a;">
                      Tu nueva contrasena temporal es:
                    </p>
                    <div style="display:inline-block;padding:14px 18px;border-radius:12px;background:#111111;color:#ff9f45;font-size:24px;font-weight:800;letter-spacing:2px;">
                      ${temporaryPassword}
                    </div>
                  </div>
                  <p style="margin:28px 0 0;font-size:14px;line-height:24px;color:#6b6b6b;">
                    Por seguridad, te recomendamos iniciar sesion con esta clave y cambiarla apenas ingreses. Si no solicitaste este cambio, avisa a un administrador.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 40px;background:#fff1e6;border-top:1px solid #ffd4b3;">
                  <p style="margin:0;font-size:12px;line-height:20px;color:#7a4b20;text-align:center;">
                    SIGEPA · Gestion de usuarios y acceso
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;
