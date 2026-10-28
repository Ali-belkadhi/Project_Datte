// MODULE A — Comptes (Baha Ayadi)
import "server-only";
import type { TypeNotification } from "@/types/enums";
import { groupeTemporel } from "@/lib/format";
import type { Notification } from "@/types/domain";
import { getUtilisateurCourant } from "@/lib/auth/rbac";
import {
  listerNotifications,
  marquerLue,
  marquerToutesLues,
  supprimer,
  unreadCount,
} from "@/server/services/NotificationService";

export async function listNotifications(): Promise<Notification[]> {
  const u = await getUtilisateurCourant();
  const { items } = await listerNotifications(u.id);
  return items.map((n) => ({
    id: n.id,
    type: n.type as TypeNotification,
    titre: n.titre,
    contenu: n.contenu,
    lien: n.lien ?? undefined,
    lue: n.lue,
    creeLe: n.creeLe ?? new Date().toISOString(),
  }));
}

export async function compterNonLues() {
  const u = await getUtilisateurCourant();
  return unreadCount(u.id);
}

/** Notifications groupées « Aujourd'hui », « Cette semaine », « Plus ancien ». */
export async function listNotificationsGroupees() {
  const toutes = await listNotifications();
  const groupes = new Map<string, Notification[]>();
  for (const n of toutes) {
    const g = groupeTemporel(n.creeLe);
    groupes.set(g, [...(groupes.get(g) ?? []), n]);
  }
  return [...groupes.entries()].map(([titre, items]) => ({ titre, items }));
}

export async function marquerNotificationLue(id: string) {
  const u = await getUtilisateurCourant();
  await marquerLue(u.id, id);
}

export async function marquerToutesNotificationsLues() {
  const u = await getUtilisateurCourant();
  await marquerToutesLues(u.id);
}

export async function supprimerNotification(id: string) {
  const u = await getUtilisateurCourant();
  await supprimer(u.id, id);
}

/**
 * Envoi d'une notification (contrat utilisé par les modules B et C).
 * Persiste la notification, publie sur le bus SSE et envoie l'e-mail si requis.
 */
export async function notifier(utilisateurId: string, type: TypeNotification, donnees: Record<string, unknown>) {
  const { notifier: realNotifier } = await import("@/server/services/NotificationService");
  await realNotifier(utilisateurId, type, donnees);
  return { envoyee: true as const };
}
