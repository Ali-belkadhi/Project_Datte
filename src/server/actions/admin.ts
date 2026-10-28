"use server";
import { headers } from "next/headers";
import { ok, fail } from "@/server/core/action-result";
import type { ActionResult } from "@/types/action-result";
import { requireRole } from "@/lib/auth/rbac";
import { connectMongoose } from "@/server/db/mongoose";
import { JournalAudit, User } from "@/server/models";
import { transitionStatut } from "@/server/services/FournisseurService";
import { notifier } from "@/server/services/NotificationService";
import { MailService } from "@/server/services/MailService";
import { AdminRefuseSchema, AdminSuspendSchema, AdminDecisionSchema } from "@/lib/zod/fournisseur";

async function audit(action: string, entite: string, entiteId: string, details: Record<string, unknown>, userId: string) {
  await connectMongoose();
  const h = await headers();
  const ip = h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "";
  await JournalAudit.create({ action, entite, entiteId, details, ip, utilisateurId: userId });
}

export async function actionListFournisseurs(input: { statut?: string; q?: string; page?: number }) {
  await requireRole("ADMIN");
  const { listFournisseurs } = await import("@/server/services/FournisseurService");
  const data = await listFournisseurs(input ?? {});
  return ok(data);
}

export async function actionApproveFournisseur(input: unknown): Promise<ActionResult<{ ok: boolean }>> {
  const u = await requireRole("ADMIN");
  const parsed = AdminDecisionSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const f = await transitionStatut(parsed.data.fournisseurId, "VERIFIE");
    const supplierUser = await (async () => { await connectMongoose(); return User.findById(f.userId); })();
    await audit("APPROVE_FOURNISSEUR", "Fournisseur", parsed.data.fournisseurId, { statut: "VERIFIE" }, u.id);
    if (supplierUser) {
      await notifier(String(supplierUser._id), "FOURNISSEUR_VALIDE", {});
      void MailService.sendEmail(supplierUser.email, "Boutique vérifiée", "Votre boutique a été vérifiée.", "<p>Votre boutique a été vérifiée.</p>").catch((e) => console.error(e));
    }
    return ok({ ok: true });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function actionRefuseFournisseur(input: unknown): Promise<ActionResult<{ ok: boolean }>> {
  const u = await requireRole("ADMIN");
  const parsed = AdminRefuseSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Motif requis");
  try {
    const f = await transitionStatut(parsed.data.fournisseurId, "REFUSE", parsed.data.motif);
    const supplierUser = await (async () => { await connectMongoose(); return User.findById(f.userId); })();
    await audit("REFUSE_FOURNISSEUR", "Fournisseur", parsed.data.fournisseurId, { motif: parsed.data.motif }, u.id);
    if (supplierUser) {
      await notifier(String(supplierUser._id), "FOURNISSEUR_REFUSE", { motif: parsed.data.motif });
      void MailService.sendEmail(supplierUser.email, "Dossier refusé", parsed.data.motif, `<p>${parsed.data.motif}</p>`).catch((e) => console.error(e));
    }
    return ok({ ok: true });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function actionSuspendFournisseur(input: unknown): Promise<ActionResult<{ ok: boolean }>> {
  const u = await requireRole("ADMIN");
  const parsed = AdminSuspendSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Motif requis");
  try {
    const f = await transitionStatut(parsed.data.fournisseurId, "SUSPENDU", parsed.data.motif);
    const supplierUser = await (async () => { await connectMongoose(); return User.findById(f.userId); })();
    await audit("SUSPEND_FOURNISSEUR", "Fournisseur", parsed.data.fournisseurId, { motif: parsed.data.motif }, u.id);
    if (supplierUser) {
      await notifier(String(supplierUser._id), "FOURNISSEUR_SUSPENDU", { motif: parsed.data.motif });
      void MailService.sendEmail(supplierUser.email, "Boutique suspendue", parsed.data.motif, `<p>${parsed.data.motif}</p>`).catch((e) => console.error(e));
    }
    return ok({ ok: true });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function actionReinstateFournisseur(input: unknown): Promise<ActionResult<{ ok: boolean }>> {
  const u = await requireRole("ADMIN");
  const parsed = AdminDecisionSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const f = await transitionStatut(parsed.data.fournisseurId, "VERIFIE");
    const supplierUser = await (async () => { await connectMongoose(); return User.findById(f.userId); })();
    await audit("REINSTATE_FOURNISSEUR", "Fournisseur", parsed.data.fournisseurId, {}, u.id);
    if (supplierUser) {
      await notifier(String(supplierUser._id), "FOURNISSEUR_VALIDE", {});
    }
    return ok({ ok: true });
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}