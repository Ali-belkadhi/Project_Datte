"use server";
import { ok, fail } from "@/server/core/action-result";
import type { ActionResult } from "@/types/action-result";
import { RegisterSchema, VerifyEmailSchema, ForgotPasswordSchema, ResetPasswordSchema } from "@/lib/zod/auth";
import { registerUser, verifyEmail, resendVerification, requestPasswordReset, resetPassword, logoutAllSessions } from "@/server/services/AuthService";
import { requireRole } from "@/lib/auth/rbac";

export async function actionRegister(input: unknown): Promise<ActionResult<{ userId: string }>> {
  const parsed = RegisterSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const { userId } = await registerUser(parsed.data);
    return ok({ userId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    if (msg === "EMAIL_EXISTS") return fail("VALIDATION", undefined, "Cet e-mail est déjà utilisé.");
    return fail("INTERNE", undefined, msg);
  }
}

export async function actionVerifyEmail(input: unknown): Promise<ActionResult<undefined>> {
  const parsed = VerifyEmailSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Code invalide");
  const v = await verifyEmail(parsed.data.email, parsed.data.code);
  if (!v) return fail("VALIDATION", undefined, "Code incorrect ou expiré.");
  return ok(undefined);
}

export async function actionResendVerification(email: string, locale?: "FR" | "AR" | "EN"): Promise<ActionResult<undefined>> {
  await resendVerification(email, locale ?? "FR");
  return ok(undefined);
}

export async function actionForgotPassword(input: unknown): Promise<ActionResult<undefined>> {
  const parsed = ForgotPasswordSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "E-mail invalide");
  await requestPasswordReset(parsed.data.email);
  return ok(undefined);
}

export async function actionResetPassword(input: unknown): Promise<ActionResult<undefined>> {
  const parsed = ResetPasswordSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  const v = await resetPassword(parsed.data.email, parsed.data.code, parsed.data.motDePasse);
  if (!v) return fail("VALIDATION", undefined, "Code incorrect ou expiré.");
  return ok(undefined);
}

export async function actionLogoutAll(): Promise<ActionResult<undefined>> {
  const u = await requireRole("CLIENT", "FOURNISSEUR", "ADMIN");
  await logoutAllSessions(u.id);
  return ok(undefined);
}