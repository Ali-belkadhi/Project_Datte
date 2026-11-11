"use server";
import { ok, fail } from "@/server/core/action-result";
import type { ActionResult } from "@/types/action-result";
import { requireRole } from "@/lib/auth/rbac";
import { OnboardingStep1Schema, RibSchema, ShopEditSchema } from "@/lib/zod/fournisseur";
import {
  saveOnboardingStep1,
  saveRib,
  submitOnboarding,
  updateShopProfile,
} from "@/server/services/FournisseurService";
import { uploadDocument } from "@/server/services/DocumentService";
/* eslint-disable @typescript-eslint/no-explicit-any */

export async function actionSaveOnboardingStep1(input: unknown): Promise<ActionResult<{ id: string }>> {
  const u = await requireRole("FOURNISSEUR");
  const parsed = OnboardingStep1Schema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const f = await saveOnboardingStep1(u.id, parsed.data);
    return ok({ id: String((f as any)._id) });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function actionSaveRib(input: unknown): Promise<ActionResult<{ ok: boolean }>> {
  const u = await requireRole("FOURNISSEUR");
  const parsed = RibSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "RIB invalide");
  try {
    await saveRib(u.id, parsed.data);
    return ok({ ok: true });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function actionUploadDocument(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const u = await requireRole("FOURNISSEUR");
  const file = formData.get("file") as File | null;
  const type = String(formData.get("type") ?? "");
  if (!file) return fail("VALIDATION", undefined, "Fichier manquant");
  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const doc = await uploadDocument(u.id, type, buf, file.type, file.name);
    return ok({ id: String((doc as any)._id) });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function actionSubmitOnboarding(): Promise<ActionResult<{ ok: boolean }>> {
  const u = await requireRole("FOURNISSEUR");
  try {
    await submitOnboarding(u.id);
    // notify admins
    const { notifierAdmins } = await import("@/server/services/NotificationService");
    await notifierAdmins("NOUVELLE_DEMANDE_FOURNISSEUR", {});
    return ok({ ok: true });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function actionUpdateShop(input: unknown): Promise<ActionResult<{ ok: boolean }>> {
  const u = await requireRole("FOURNISSEUR");
  const parsed = ShopEditSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    await updateShopProfile(u.id, parsed.data);
    return ok({ ok: true });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}