/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { connectMongoose } from "@/server/db/mongoose";
import { DocumentFournisseur, Fournisseur } from "@/server/models";
import { storage } from "@/server/storage";
import { FournisseurError } from "./FournisseurService";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadDocument(userId: string, type: string, file: Buffer, mime: string, nomFichier: string) {
  if (!ALLOWED_MIME.has(mime)) throw new FournisseurError("INVALID_MIME", "Type de fichier non autorisé.");
  if (file.byteLength > MAX_BYTES) throw new FournisseurError("TOO_LARGE", "Fichier trop volumineux (max 5 Mo).");
  await connectMongoose();
  const f = await Fournisseur.findOne({ userId });
  if (!f) throw new FournisseurError("NOT_FOUND", "Fournisseur introuvable");
  if (f.statutVerification !== "EN_ATTENTE" && f.statutVerification !== "REFUSE") {
    throw new FournisseurError("LOCKED", "Documents verrouillés.");
  }
  // replace existing doc of same type
  await (DocumentFournisseur as any).deleteMany({ fournisseurId: (f as any)._id, type });
  const name = `priv-${f._id}-${type}-${Date.now()}`;
  // private storage: use a private folder via storage? reuse storage but mark private by path prefix
  const url = await storage.save(file, name, mime); // local disk public/uploads; for true privacy swap storage impl
  const doc = await (DocumentFournisseur as any).create({ fournisseurId: (f as any)._id, type, fichierUrl: url, nomFichier, valide: null });
  return doc;
}