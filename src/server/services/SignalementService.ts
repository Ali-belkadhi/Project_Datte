/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { connectMongoose } from "@/server/db/mongoose";
import { Signalement, User } from "@/server/models";
import { getModerationPort } from "./ModerationPort";
import { JournalAudit } from "@/server/models";

export async function creerSignalement(auteurId: string, input: { cibleType: string; cibleId: string; motif: string; texteLibre?: string }) {
  await connectMongoose();
  // prevent self-report: if cible is user? best-effort skip
  const existing = await (Signalement as any).findOne({ auteurId, cibleType: input.cibleType, cibleId: input.cibleId });
  if (existing) throw new Error("DUPLICATE");
  const s = await (Signalement as any).create({ auteurId, cibleType: input.cibleType, cibleId: input.cibleId, motif: input.motif, texteLibre: input.texteLibre, statut: "OUVERT" });
  return s;
}

export async function listerSignalements(filter: { statut?: string; cibleType?: string; page?: number; limit?: number }) {
  await connectMongoose();
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const q: Record<string, unknown> = {};
  if (filter.statut) q.statut = filter.statut;
  if (filter.cibleType) q.cibleType = filter.cibleType;
  const total = await (Signalement as any).countDocuments(q);
  const items = await (Signalement as any).find(q).sort({ creeLe: -1 }).skip((page - 1) * limit).limit(limit);
  return { items, total, page, limit };
}

export async function traiterSignalement(id: string, decision: "MASQUER" | "REJETER" | "TRAITE", note: string | undefined, adminId: string) {
  await connectMongoose();
  const s = await (Signalement as any).findById(id);
  if (!s) throw new Error("NOT_FOUND");
  if (decision === "MASQUER") {
    const port = getModerationPort();
    if (s.cibleType === "PRODUIT") await port.masquerProduit(s.cibleId);
    if (s.cibleType === "AVIS") await port.masquerAvis(s.cibleId);
  }
  s.statut = decision === "REJETER" ? "REJETE" : "TRAITE";
  s.traiteParId = adminId;
  s.noteAdmin = note;
  await s.save();
  // reporting a MESSAGE gives admin read access to conversation; log audit
  if (s.cibleType === "MESSAGE") {
    await (JournalAudit as any).create({ action: "SIGNALEMENT_MESSAGE_ACCES", entite: "Signalement", entiteId: String(s._id), details: { conversationId: s.cibleId }, utilisateurId: adminId });
  }
  // notify reporter (in-app only)
  const reporter = await User.findById(s.auteurId);
  if (reporter) {
    const { notifier } = await import("./NotificationService");
    await notifier(String(reporter._id), "LITIGE", { signalementId: String(s._id), decision });
  }
  await (JournalAudit as any).create({ action: "SIGNALEMENT_TRAITE", entite: "Signalement", entiteId: String(s._id), details: { decision, note }, utilisateurId: adminId });
  return s;
}