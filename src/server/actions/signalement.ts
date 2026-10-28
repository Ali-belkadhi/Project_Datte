/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { ok, fail } from "@/server/core/action-result";
import type { ActionResult } from "@/types/action-result";
import { requireRole } from "@/lib/auth/rbac";
import { CreerSignalementSchema, TraiterSignalementSchema } from "@/lib/zod/signalement";
import * as S from "@/server/services/SignalementService";

export async function actionCreerSignalement(input: unknown): Promise<ActionResult<{ id: string }>> {
  const u = await requireRole("CLIENT", "FOURNISSEUR", "ADMIN");
  const parsed = CreerSignalementSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const s = await S.creerSignalement(u.id, parsed.data);
    return ok({ id: String((s as any)._id) });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function actionListerSignalements(input: { statut?: string; cibleType?: string; page?: number }) {
  await requireRole("ADMIN");
  const data = await S.listerSignalements(input ?? {});
  return ok(data);
}

export async function actionTraiterSignalement(input: unknown): Promise<ActionResult<{ ok: boolean }>> {
  const u = await requireRole("ADMIN");
  const parsed = TraiterSignalementSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    await S.traiterSignalement(parsed.data.id, parsed.data.decision, parsed.data.note, u.id);
    return ok({ ok: true });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}