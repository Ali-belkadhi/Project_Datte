"use server";
import { ok } from "@/server/core/action-result";
import { requireRole } from "@/lib/auth/rbac";
import {
  listerNotifications,
  marquerLue,
  marquerToutesLues,
  supprimer,
  unreadCount,
} from "@/server/services/NotificationService";

export async function actionListerNotifications(cursor?: string, unreadOnly?: boolean) {
  const u = await requireRole("CLIENT", "FOURNISSEUR", "ADMIN");
  const data = await listerNotifications(u.id, cursor, unreadOnly);
  return ok(data);
}

export async function actionMarquerLue(id: string) {
  const u = await requireRole("CLIENT", "FOURNISSEUR", "ADMIN");
  await marquerLue(u.id, id);
  return ok({ ok: true });
}

export async function actionMarquerToutesLues() {
  const u = await requireRole("CLIENT", "FOURNISSEUR", "ADMIN");
  await marquerToutesLues(u.id);
  return ok({ ok: true });
}

export async function actionSupprimerNotification(id: string) {
  const u = await requireRole("CLIENT", "FOURNISSEUR", "ADMIN");
  await supprimer(u.id, id);
  return ok({ ok: true });
}

export async function actionUnreadCount() {
  const u = await requireRole("CLIENT", "FOURNISSEUR", "ADMIN");
  const c = await unreadCount(u.id);
  return ok({ count: c });
}