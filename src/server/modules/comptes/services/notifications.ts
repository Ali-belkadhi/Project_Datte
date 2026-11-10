// MODULE A — Comptes (Baha Ayadi)
import "server-only";
import type { TypeNotification } from "@/types/enums";
import { groupeTemporel } from "@/lib/format";
import type { Notification } from "@/types/domain";
import { notificationRepository } from "../repositories";
import { getUtilisateurCourant } from "./utilisateurs";

export async function listNotifications() {
  const u = await getUtilisateurCourant();
  return notificationRepository.pourUtilisateur(u.id, u.role);
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

export async function compterNonLues() {
  const toutes = await listNotifications();
  return toutes.filter((n) => !n.lue).length;
}

/**
 * Envoi d'une notification (contrat utilisé par les modules B et C).
 * TODO(module A) : persister la notification + Web Push (AbonnementPush) + e-mail.
 */
export async function notifier(utilisateurId: string, type: TypeNotification, donnees: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[démo] notifier(${utilisateurId}, ${type})`, donnees);
  }
  return { envoyee: false as const, raison: "démo" };
}
