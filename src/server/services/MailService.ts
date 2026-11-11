import "server-only";
import nodemailer from "nodemailer";

type Langue = "FR" | "AR" | "EN";
type Purpose = "VERIFY_EMAIL" | "RESET_PASSWORD" | "VERIFY_PHONE_CHANGE";

function transporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: (process.env.SMTP_PORT ?? "465") === "465",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const subjects: Record<Purpose, Record<Langue, string>> = {
  VERIFY_EMAIL: { FR: "Vérifiez votre e-mail — DEGLA", AR: "تحقق من بريدك — DEGLA", EN: "Verify your email — DEGLA" },
  RESET_PASSWORD: { FR: "Réinitialiser votre mot de passe — DEGLA", AR: "إعادة تعيين كلمة المرور — DEGLA", EN: "Reset your password — DEGLA" },
  VERIFY_PHONE_CHANGE: { FR: "Vérifiez votre téléphone — DEGLA", AR: "تحقق من هاتفك — DEGLA", EN: "Verify your phone — DEGLA" },
};

function body(code: string, purpose: Purpose, locale: Langue): { text: string; html: string } {
  const rtl = locale === "AR";
  const dir = rtl ? "rtl" : "ltr";
  const intro =
    purpose === "VERIFY_EMAIL"
      ? { FR: "Votre code de vérification :", AR: "رمز التحقق الخاص بك:", EN: "Your verification code:" }[locale]
      : purpose === "RESET_PASSWORD"
        ? { FR: "Votre code de réinitialisation :", AR: "رمز إعادة التعيين:", EN: "Your reset code:" }[locale]
        : { FR: "Votre code :", AR: "رمزك:", EN: "Your code:" }[locale];
  const text = `${intro} ${code}\n\nCe code expire dans 10 minutes.`;
  const html = `<!doctype html><html dir="${dir}"><body style="font-family:system-ui,sans-serif;padding:24px">
    <p>${intro}</p>
    <p style="font-size:32px;font-weight:700;letter-spacing:6px">${code}</p>
    <p style="color:#666;font-size:12px">Expire dans 10 minutes / Expires in 10 minutes.</p>
  </body></html>`;
  return { text, html };
}

export class MailService {
  static async sendEmail(to: string, subject: string, text: string, html: string): Promise<void> {
    const t = transporter();
    await t.sendMail({ from: process.env.SMTP_FROM ?? process.env.SMTP_USER, to, subject, text, html });
  }

  static async sendOtpEmail(to: string, code: string, purpose: Purpose, locale: Langue): Promise<void> {
    const t = transporter();
    const { text, html } = body(code, purpose, locale);
    await t.sendMail({
      from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
      to,
      subject: subjects[purpose][locale],
      text,
      html,
    });
  }
}