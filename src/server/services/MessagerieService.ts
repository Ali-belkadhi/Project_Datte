/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { connectMongoose } from "@/server/db/mongoose";
import { Conversation, Message, User, Fournisseur } from "@/server/models";
import { notificationBus } from "./NotificationBus";
import { notifier } from "./NotificationService";

const rateMap = new Map<string, number[]>();

function checkRate(userId: string) {
  const now = Date.now();
  const arr = (rateMap.get(userId) ?? []).filter((t) => now - t < 60000);
  if (arr.length >= 20) throw new Error("RATE_LIMIT");
  arr.push(now);
  rateMap.set(userId, arr);
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, "").trim();
}

export async function demarrerConversation(clientId: string, input: { fournisseurId: string; produitId?: string; sousCommandeId?: string }) {
  await connectMongoose();
  // Identifiants de catalogue non persistés (fiches de vitrine) : refus explicite plutôt qu'une CastError.
  if (!/^[a-f0-9]{24}$/i.test(input.fournisseurId)) throw new Error("FOURNISSEUR_HORS_LIGNE");
  // verify supplier verified and active
  const f = await Fournisseur.findById(input.fournisseurId);
  if (!f || f.statutVerification !== "VERIFIE") throw new Error("FOURNISSEUR_NON_VERIFIE");
  const supplierUser = await User.findById(f.userId);
  if (!supplierUser || supplierUser.statut !== "ACTIF") throw new Error("FOURNISSEUR_INACTIF");
  // only client can start
  const conv = await (Conversation as any).findOneAndUpdate(
    { clientId, fournisseurId: f._id, produitId: input.produitId ?? null, sousCommandeId: input.sousCommandeId ?? null },
    { $setOnInsert: { clientId, fournisseurId: f._id, produitId: input.produitId ?? null, sousCommandeId: input.sousCommandeId ?? null } },
    { upsert: true, new: true },
  );
  return conv;
}

export async function envoyerMessage(userId: string, input: { conversationId: string; contenu: string }) {
  checkRate(userId);
  await connectMongoose();
  const conv = await (Conversation as any).findById(input.conversationId);
  if (!conv) throw new Error("NOT_FOUND");
  const isClient = String(conv.clientId) === userId;
  const f = await Fournisseur.findById(conv.fournisseurId);
  if (!f) throw new Error("NOT_FOUND");
  const isSupplier = String(f.userId) === userId;
  if (!isClient && !isSupplier) throw new Error("FORBIDDEN");
  const contenu = stripHtml(input.contenu).slice(0, 2000);
  if (!contenu) throw new Error("EMPTY");
  const msg = await (Message as any).create({ conversationId: conv._id, expediteurId: userId, contenu, lu: false });
  conv.dernierMessageLe = new Date();
  await conv.save();
  const recipientId = isClient ? String(f.userId) : String(conv.clientId);
  // notification merge burst
  await notifier(recipientId, "NOUVEAU_MESSAGE", { conversationId: String(conv._id) });
  notificationBus.publish(recipientId, { type: "message", conversationId: String(conv._id), messageId: String(msg._id) });
  return msg;
}

export async function listerConversations(userId: string) {
  await connectMongoose();
  const convs = await (Conversation as any).find({ $or: [{ clientId: userId }, { fournisseurId: { $in: await Fournisseur.find({ userId }).distinct("_id") } }] }).sort({ dernierMessageLe: -1 });
  const result = [];
  for (const c of convs) {
    const last = await (Message as any).findOne({ conversationId: c._id }).sort({ creeLe: -1 });
    const unread = await (Message as any).countDocuments({ conversationId: c._id, lu: false, expediteurId: { $ne: userId } });
    result.push({ id: String(c._id), clientId: String(c.clientId), fournisseurId: String(c.fournisseurId), dernierMessageLe: c.dernierMessageLe, lastMessage: last?.contenu, unread });
  }
  return result;
}

export async function listerMessages(conversationId: string, userId: string, cursor?: string) {
  await connectMongoose();
  const conv = await (Conversation as any).findById(conversationId);
  if (!conv) throw new Error("NOT_FOUND");
  const f = await Fournisseur.findById(conv.fournisseurId);
  const isClient = String(conv.clientId) === userId;
  const isSupplier = f && String(f.userId) === userId;
  if (!isClient && !isSupplier) throw new Error("FORBIDDEN");
  const q: Record<string, unknown> = { conversationId };
  if (cursor) q.creeLe = { $lt: new Date(cursor) };
  const items = await (Message as any).find(q).sort({ creeLe: -1 }).limit(50);
  return items.map((m: any) => ({ id: String(m._id), expediteurId: String(m.expediteurId), contenu: m.contenu, lu: m.lu, creeLe: m.creeLe }));
}

export async function marquerLus(conversationId: string, userId: string) {
  await connectMongoose();
  const conv = await (Conversation as any).findById(conversationId);
  if (!conv) return;
  const f = await Fournisseur.findById(conv.fournisseurId);
  const isClient = String(conv.clientId) === userId;
  const isSupplier = f && String(f.userId) === userId;
  if (!isClient && !isSupplier) return;
  await (Message as any).updateMany({ conversationId, expediteurId: { $ne: userId }, lu: false }, { $set: { lu: true } });
}

// entry point for modules B/C
export async function ouvrirConversation(userId: string, input: { fournisseurId: string; produitId?: string; sousCommandeId?: string }) {
  await connectMongoose();
  if (!/^[a-f0-9]{24}$/i.test(input.fournisseurId)) throw new Error("FOURNISSEUR_HORS_LIGNE");
  const f = await Fournisseur.findById(input.fournisseurId);
  if (!f || f.statutVerification !== "VERIFIE") throw new Error("FOURNISSEUR_NON_VERIFIE");
  const conv = await demarrerConversation(userId, { fournisseurId: String(f._id), produitId: input.produitId, sousCommandeId: input.sousCommandeId });
  return String(conv._id);
}