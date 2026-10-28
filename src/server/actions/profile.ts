"use server";
import { ok, fail } from "@/server/core/action-result";
import type { ActionResult } from "@/types/action-result";
import { ProfileUpdateSchema } from "@/lib/zod/auth";
import { updateProfile, updateAvatar } from "@/server/services/ProfileService";

export async function actionUpdateProfile(input: unknown): Promise<ActionResult<undefined>> {
  const parsed = ProfileUpdateSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  await updateProfile(parsed.data);
  return ok(undefined);
}

export async function actionUpdateAvatar(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const file = formData.get("avatar") as File | null;
  if (!file) return fail("VALIDATION", undefined, "Fichier manquant");
  const buf = Buffer.from(await file.arrayBuffer());
  try {
    const url = await updateAvatar(buf, file.type);
    return ok({ url });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}