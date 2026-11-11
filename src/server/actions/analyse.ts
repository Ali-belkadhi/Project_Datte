/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { ok, fail } from "@/server/core/action-result";
import type { ActionResult } from "@/types/action-result";
import { requireRole } from "@/lib/auth/rbac";
import { getUtilisateurCourant } from "@/lib/auth/rbac";
import { analyserDocuments } from "@/server/services/AnalyseDocumentsService";
import { Fournisseur } from "@/server/models";
import { connectMongoose } from "@/server/db/mongoose";

export async function actionAnalyserDocuments(fournisseurId: string): Promise<ActionResult<{ ok: boolean }>> {
  const u = await getUtilisateurCourant();
  let isAdmin = false;
  try {
    await requireRole("ADMIN");
    isAdmin = true;
  } catch {
    isAdmin = false;
  }
  if (!isAdmin) {
    // owning supplier check
    await connectMongoose();
    const f = await (Fournisseur as any).findById(fournisseurId);
    if (!f || String(f.userId) !== u.id) return fail("FORBIDDEN", undefined, "Accès refusé");
  }
  try {
    await analyserDocuments(fournisseurId, u.id, isAdmin);
    return ok({ ok: true });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}