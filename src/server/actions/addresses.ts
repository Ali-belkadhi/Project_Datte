"use server";
import { ok, fail } from "@/server/core/action-result";
import type { ActionResult } from "@/types/action-result";
import { AdresseSchema } from "@/lib/zod/auth";
import { requireRole } from "@/lib/auth/rbac";
import { listAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from "@/server/services/AddressService";

export async function actionListAddresses() {
  const u = await requireRole("CLIENT");
  const data = await listAddresses(u.id);
  return ok(data);
}

export async function actionCreateAddress(input: unknown): Promise<ActionResult<{ id: string }>> {
  const u = await requireRole("CLIENT");
  const parsed = AdresseSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  const id = await createAddress(u.id, parsed.data);
  return ok({ id });
}

export async function actionUpdateAddress(id: string, input: unknown): Promise<ActionResult<undefined>> {
  const u = await requireRole("CLIENT");
  const parsed = AdresseSchema.partial().safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  await updateAddress(u.id, id, parsed.data);
  return ok(undefined);
}

export async function actionDeleteAddress(id: string): Promise<ActionResult<undefined>> {
  const u = await requireRole("CLIENT");
  await deleteAddress(u.id, id);
  return ok(undefined);
}

export async function actionSetDefaultAddress(id: string): Promise<ActionResult<undefined>> {
  const u = await requireRole("CLIENT");
  await setDefaultAddress(u.id, id);
  return ok(undefined);
}