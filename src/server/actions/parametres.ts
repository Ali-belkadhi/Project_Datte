"use server";
import { ok, fail } from "@/server/core/action-result";
import type { ActionResult } from "@/types/action-result";
import { requireRole } from "@/lib/auth/rbac";
import { ParametresPatchSchema } from "@/lib/zod/parametres";
import { getParametres, updateParametres } from "@/server/services/ParametresService";

export async function actionGetParametres() {
  await requireRole("ADMIN");
  const data = await getParametres();
  return ok(data);
}

export async function actionUpdateParametres(input: unknown): Promise<ActionResult<{ ok: boolean }>> {
  const u = await requireRole("ADMIN");
  const parsed = ParametresPatchSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    await updateParametres(parsed.data, u.id);
    return ok({ ok: true });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}