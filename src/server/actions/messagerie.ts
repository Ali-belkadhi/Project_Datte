/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { ok, fail } from "@/server/core/action-result";
import type { ActionResult } from "@/types/action-result";
import { requireRole } from "@/lib/auth/rbac";
import { DemarrerConversationSchema, EnvoyerMessageSchema, ListerMessagesSchema } from "@/lib/zod/messagerie";
import * as M from "@/server/services/MessagerieService";

export async function actionDemarrerConversation(input: unknown): Promise<ActionResult<{ id: string }>> {
  const u = await requireRole("CLIENT");
  const parsed = DemarrerConversationSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const conv = await M.demarrerConversation(u.id, parsed.data);
    return ok({ id: String((conv as any)._id) });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function actionEnvoyerMessage(input: unknown): Promise<ActionResult<{ id: string }>> {
  const u = await requireRole("CLIENT", "FOURNISSEUR");
  const parsed = EnvoyerMessageSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const msg = await M.envoyerMessage(u.id, parsed.data);
    return ok({ id: String((msg as any)._id) });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function actionListerConversations() {
  const u = await requireRole("CLIENT", "FOURNISSEUR");
  const data = await M.listerConversations(u.id);
  return ok(data);
}

export async function actionListerMessages(input: unknown) {
  const u = await requireRole("CLIENT", "FOURNISSEUR");
  const parsed = ListerMessagesSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const data = await M.listerMessages(parsed.data.conversationId, u.id, parsed.data.cursor);
    return ok(data);
  } catch (e) {
    return fail("FORBIDDEN", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function actionMarquerLus(conversationId: string) {
  const u = await requireRole("CLIENT", "FOURNISSEUR");
  await M.marquerLus(conversationId, u.id);
  return ok({ ok: true });
}