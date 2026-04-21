import nodemailer from "nodemailer";

const getMailTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    throw new Error("Faltan credenciales SMTP en las variables de entorno");
  }

  return nodemailer.createTransport({
    host,
    port,
    auth: {
      user,
      pass,
    },
  });
};

type SendMailParams = {
  to: string;
  subject: string;
  html: string;
};

export const sendMail = async ({ to, subject, html }: SendMailParams) => {
  const transporter = getMailTransporter();

  await transporter.sendMail({
    from: {
      name: process.env.SMTP_FROM_NAME || "SIGEPA",
      address: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "",
    },
    to,
    subject,
    html,
  });
};
