/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { connectMongoose } from "@/server/db/mongoose";
import { Notification, User } from "@/server/models";
import { notificationBus } from "./NotificationBus";
import { buildNotification, EMAIL_TYPES } from "./NotificationTemplates";
import { MailService } from "./MailService";

async function sendEmailWithRetry(to: string, subject: string, text: string, html: string) {
  let attempt = 0;
  while (attempt < 3) {
    try {
      await MailService.sendEmail(to, subject, text, html);
      return;
    } catch (e) {
      attempt++;
      if (attempt >= 3) {
        console.error("Mail send failed after retries", e);
        return;
      }
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

export async function notifier(utilisateurId: string, type: string, donnees?: Record<string, unknown>): Promise<void> {
  try {
    await connectMongoose();
    const user = await User.findById(utilisateurId);
    if (!user) return;
    const { titre, contenu, lien } = buildNotification(type, donnees);
    const notif = await (Notification as any).create({ userId: utilisateurId, type, titre, contenu, lien, donnees, lue: false });
    notificationBus.publish(utilisateurId, { id: String((notif as any)._id), type, titre, contenu, lien, creeLe: (notif as any).creeLe });
    if (EMAIL_TYPES.has(type)) {
      // async, non-blocking
      void (async () => {
        try {
          await sendEmailWithRetry(user.email, titre, contenu, `<p>${contenu}</p>`);
        } catch (e) {
          console.error("Notification email failed", e);
        }
      })();
    }
  } catch (e) {
    console.error("notifier failed", e);
  }
}

export async function notifierAdmins(type: string, donnees?: Record<string, unknown>): Promise<void> {
  await connectMongoose();
  const admins = await User.find({ role: "ADMIN" });
  await Promise.all(admins.map((a) => notifier(String(a._id), type, donnees)));
}

export async function listerNotifications(userId: string, cursor?: string, unreadOnly?: boolean) {
  await connectMongoose();
  const q: Record<string, unknown> = { userId };
  if (unreadOnly) q.lue = false;
  if (cursor) q.creeLe = { $lt: new Date(cursor) };
  const items = await Notification.find(q).sort({ creeLe: -1 }).limit(20);
  const nextCursor = items.length ? items[items.length - 1].creeLe?.toISOString() : null;
  return { items: items.map((n) => ({ id: String(n._id), type: n.type, titre: n.titre, contenu: n.contenu, lien: n.lien, lue: n.lue, creeLe: n.creeLe?.toISOString() })), nextCursor };
}

export async function marquerLue(userId: string, id: string) {
  await connectMongoose();
  await Notification.updateOne({ _id: id, userId }, { $set: { lue: true } });
}

export async function marquerToutesLues(userId: string) {
  await connectMongoose();
  await Notification.updateMany({ userId, lue: false }, { $set: { lue: true } });
}

export async function supprimer(userId: string, id: string) {
  await connectMongoose();
  await Notification.deleteOne({ _id: id, userId });
}

export async function unreadCount(userId: string) {
  await connectMongoose();
  return Notification.countDocuments({ userId, lue: false });
}