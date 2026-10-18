/**
 * Module A - EmailService
 * Envoi d'emails transactionnels (vérification email, réinitialisation de mot de passe, OTP).
 * Priorité : Gmail SMTP → Resend → log de développement.
 */

import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const CLE = process.env.RESEND_API_KEY;
const EXPE = 'DEGLA <notifications@degla.tn>';

// Gmail SMTP (mot de passe d'application)
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');

/** Vrai si une clé Resend utilisable est présente */
export function emailConfigure(): boolean {
  return Boolean(CLE) && !CLE!.startsWith('your-');
}

/** Vrai si un compte Gmail SMTP utilisable est configuré */
export function smtpConfigure(): boolean {
  return Boolean(GMAIL_USER && GMAIL_APP_PASSWORD);
}

/** Vrai si un canal d'envoi d'email est disponible (Resend ou Gmail SMTP) */
export function canalEmailDisponible(): boolean {
  return emailConfigure() || smtpConfigure();
}

interface EmailPayload {
  to: string;
  sujet: string;
  titre: string;
  message: string;
  bouton?: { label: string; url: string };
  /** Code à afficher en évidence (ex. OTP) */
  code?: string;
}

export class EmailService {
  /**
   * Envoi générique.
   * Priorité : Gmail SMTP (si configuré) → Resend → log de développement.
   */
  static async envoyer({ to, sujet, titre, message, bouton, code }: EmailPayload) {
    if (!canalEmailDisponible()) {
      console.info(`[EmailService] (dev) À ${to} — ${sujet}\n${message}${code ? `\nCode : ${code}` : ''}${bouton ? `\n${bouton.url}` : ''}`);
      return { simule: true };
    }

    const html = EmailService.gabarit({ titre, message, bouton, code });

    // Gmail SMTP en priorité
    if (smtpConfigure()) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
      });

      await transporter.sendMail({
        from: `DEGLA <${GMAIL_USER}>`,
        to,
        subject: sujet,
        html,
      });

      return { simule: false };
    }

    // Repli : Resend
    const resend = new Resend(CLE);
    await resend.emails.send({ from: EXPE, to, subject: sujet, html });

    return { simule: false };
  }

  /** Envoie un code OTP par email */
  static envoyerCodeOtp(to: string, code: string, minutesValidite: number, prenom?: string) {
    return EmailService.envoyer({
      to,
      sujet: 'Votre code de vérification — DEGLA',
      titre: `${prenom ? `Bonjour ${prenom}, ` : ''}voici votre code`,
      message: `Utilisez ce code pour vérifier votre compte. Il est valable ${minutesValidite} minutes et ne doit être partagé avec personne.`,
      code,
    });
  }

  static envoyerVerificationEmail(to: string, prenom: string, url: string) {
    return EmailService.envoyer({
      to,
      sujet: 'Vérifiez votre adresse email — DEGLA',
      titre: 'Confirmez votre adresse email',
      message: `Bonjour ${prenom}, bienvenue chez DEGLA 🌴. Cliquez sur le bouton ci-dessous pour activer votre compte. Ce lien expire dans 24 heures.`,
      bouton: { label: 'Vérifier mon email', url },
    });
  }

  static envoyerReinitialisationMotDePasse(to: string, prenom: string, url: string) {
    return EmailService.envoyer({
      to,
      sujet: 'Réinitialisation de votre mot de passe — DEGLA',
      titre: 'Réinitialiser votre mot de passe',
      message: `Bonjour ${prenom}, vous avez demandé la réinitialisation de votre mot de passe. Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
      bouton: { label: 'Choisir un nouveau mot de passe', url },
    });
  }

  static envoyerBienvenue(to: string, prenom: string) {
    return EmailService.envoyer({
      to,
      sujet: 'Bienvenue chez DEGLA',
      titre: 'Votre compte est actif',
      message: `Bonjour ${prenom}, votre compte DEGLA est désormais actif. Découvrez nos dattes de Kébili et nos coffrets cadeaux.`,
      bouton: { label: 'Découvrir la boutique', url: `${process.env.NEXTAUTH_URL ?? ''}/produits` },
    });
  }

  private static gabarit({ titre, message, bouton, code }: Omit<EmailPayload, 'to' | 'sujet'>) {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px;">
        <h2 style="color: #123b2a; font-family: Georgia, serif;">DEGLA 🌴</h2>
        <h3 style="color: #17231d;">${titre}</h3>
        <p style="color: #5f6b63; line-height: 1.6;">${message}</p>
        ${code ? `<div style="margin:24px 0; padding:16px 24px; background:#f6f0e4; border:1px solid #e6dcc6; border-radius:12px; text-align:center;">
          <span style="font-size:32px; letter-spacing:8px; font-weight:700; color:#123b2a; font-family:monospace;">${code}</span>
        </div>` : ''}
        ${bouton ? `<a href="${bouton.url}" style="display:inline-block; background:#123b2a; color:#f6f0e4; padding:12px 24px; border-radius:999px; text-decoration:none; margin-top:16px;">${bouton.label}</a>` : ''}
        <p style="color:#b88a3b; font-size:12px; margin-top:32px;">© ${new Date().getFullYear()} DEGLA — Dattes de Kébili, Tunisie</p>
      </div>
    `;
  }
}

export default EmailService;
