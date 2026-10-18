/**
 * Module A - NotificationService
 * In-app, Email (Resend), and Web Push notifications
 * CONTRACT: notifier() used by Modules B & C
 */

import connectDB from '@/lib/mongoose';
import Notification from '@/domain/models/Notification';
import AbonnementPush from '@/domain/models/AbonnementPush';
import Utilisateur from '@/domain/models/Utilisateur';
import { TypeNotification } from '@/domain/enums';
import { Resend } from 'resend';
import webpush from 'web-push';

// Configure Web Push (silencieux si les clés sont absentes ou invalides)
if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
  try {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@degla.tn',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } catch (err) {
    console.warn('[NotificationService] Clés VAPID invalides — web push désactivé.', err);
  }
}

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotifPayload {
  titre: string;
  contenu: string;
  lien?: string;
}

export class NotificationService {

  // ─── CONTRACT: notifier() used by Modules B & C ────────────────────────────

  /**
   * Main contract function - sends notification via all channels
   * Called by Module B (3D ready, low credits) and C (order status)
   */
  static async notifier(
    utilisateurId: string,
    type: TypeNotification,
    donnees: NotifPayload
  ) {
    await connectDB();

    // 1. Create in-app notification
    await Notification.create({
      utilisateurId,
      type,
      titre: donnees.titre,
      contenu: donnees.contenu,
      lien: donnees.lien,
    });

    // 2. Send Web Push (fire and forget)
    NotificationService.envoyerPush(utilisateurId, donnees).catch(console.error);

    // 3. Send email for important events
    const emailTypes = [
      TypeNotification.COMMANDE_STATUT,
      TypeNotification.FOURNISSEUR_VALIDE,
      TypeNotification.LITIGE,
      TypeNotification.MODELE_3D_PRET,
    ];

    if (emailTypes.includes(type)) {
      const utilisateur = await Utilisateur.findById(utilisateurId).select('email nom prenom');
      if (utilisateur) {
        NotificationService.envoyerEmail(
          utilisateur.email,
          `${utilisateur.prenom} ${utilisateur.nom}`,
          donnees
        ).catch(console.error);
      }
    }
  }

  // ─── IN-APP ───────────────────────────────────────────────────────────────────

  static async getNotifications(utilisateurId: string, page = 1, limit = 20) {
    await connectDB();
    const skip = (page - 1) * limit;

    const [notifications, total, nonLues] = await Promise.all([
      Notification.find({ utilisateurId })
        .sort({ creeLe: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ utilisateurId }),
      Notification.countDocuments({ utilisateurId, lue: false }),
    ]);

    return { notifications, total, nonLues, page };
  }

  static async marquerLue(notifId: string, utilisateurId: string) {
    await connectDB();
    return Notification.findOneAndUpdate(
      { _id: notifId, utilisateurId },
      { $set: { lue: true } },
      { new: true }
    );
  }

  static async marquerToutesLues(utilisateurId: string) {
    await connectDB();
    return Notification.updateMany(
      { utilisateurId, lue: false },
      { $set: { lue: true } }
    );
  }

  // ─── WEB PUSH ─────────────────────────────────────────────────────────────────

  static async souscrirePush(
    utilisateurId: string,
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
  ) {
    await connectDB();
    return AbonnementPush.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        utilisateurId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      { upsert: true, new: true }
    );
  }

  static async supprimerSouscription(endpoint: string) {
    await connectDB();
    return AbonnementPush.deleteOne({ endpoint });
  }

  private static async envoyerPush(utilisateurId: string, payload: NotifPayload) {
    await connectDB();
    const abonnements = await AbonnementPush.find({ utilisateurId }).lean();

    const pushPayload = JSON.stringify({
      title: payload.titre,
      body: payload.contenu,
      url: payload.lien || '/',
    });

    const sendPromises = abonnements.map(async (abonnement) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: abonnement.endpoint,
            keys: { p256dh: abonnement.p256dh, auth: abonnement.auth },
          },
          pushPayload
        );
      } catch (err: any) {
        // Remove invalid subscriptions (410 = Gone)
        if (err.statusCode === 410) {
          await AbonnementPush.deleteOne({ _id: abonnement._id });
        }
      }
    });

    await Promise.allSettled(sendPromises);
  }

  // ─── EMAIL (Resend) ───────────────────────────────────────────────────────────

  private static async envoyerEmail(
    to: string,
    nom: string,
    payload: NotifPayload
  ) {
    if (!process.env.RESEND_API_KEY) return;

    await resend.emails.send({
      from: 'DEGLA <notifications@degla.tn>',
      to,
      subject: payload.titre,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px;">
          <h2 style="color: #78350f;">DEGLA 🌴</h2>
          <p>Bonjour ${nom},</p>
          <p>${payload.contenu}</p>
          ${payload.lien ? `<a href="${process.env.NEXTAUTH_URL}${payload.lien}" 
            style="display:inline-block; background:#92400e; color:white; 
            padding:12px 24px; border-radius:8px; text-decoration:none; margin-top:16px;">
            Voir les détails
          </a>` : ''}
          <hr style="margin-top:32px; border-color:#e5e7eb;" />
          <p style="color:#9ca3af; font-size:12px;">
            © 2026 DEGLA — Marketplace de dattes tunisiennes
          </p>
        </div>
      `,
    });
  }
}

export default NotificationService;
