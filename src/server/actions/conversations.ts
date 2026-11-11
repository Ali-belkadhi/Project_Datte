"use server";
import { ok, fail } from "@/server/core/action-result";
import type { ActionResult } from "@/types/action-result";
import { requireRole } from "@/lib/auth/rbac";
import { ouvrirConversation } from "@/server/services/MessagerieService";

export async function actionOuvrirConversation(input: { fournisseurId: string; produitId?: string; sousCommandeId?: string }): Promise<ActionResult<{ id: string }>> {
  const u = await requireRole("CLIENT");
  try {
    const id = await ouvrirConversation(u.id, input);
    return ok({ id });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}