import "server-only";
import bcrypt from "bcryptjs";
import { connectMongoose } from "@/server/db/mongoose";
import { User } from "@/server/models";
import { storage } from "@/server/storage";
import sharp from "sharp";
import { requireRole } from "@/lib/auth/rbac";

export async function updateProfile(input: { prenom: string; nom: string; langue: "FR" | "AR" | "EN"; telephone?: string }) {
  const u = await requireRole("CLIENT", "FOURNISSEUR", "ADMIN");
  await connectMongoose();
  const patch: Record<string, unknown> = { prenom: input.prenom, nom: input.nom, langue: input.langue };
  if (input.telephone !== undefined) {
    const tel = input.telephone.trim();
    if (tel) {
      const existant = await User.findOne({ telephone: tel, _id: { $ne: u.id } }).select("_id");
      if (existant) throw new Error("TELEPHONE_EXISTS");
      patch.telephone = tel;
    }
  }
  await User.updateOne({ _id: u.id }, { $set: patch });
  return { ok: true };
}

export async function changerMotDePasse(motDePasseActuel: string, nouveauMotDePasse: string) {
  const u = await requireRole("CLIENT", "FOURNISSEUR", "ADMIN");
  await connectMongoose();
  const doc = await User.findById(u.id);
  if (!doc) throw new Error("NOT_FOUND");
  if (!doc.motDePasseHash) throw new Error("NO_PASSWORD");
  const valide = await bcrypt.compare(motDePasseActuel, doc.motDePasseHash);
  if (!valide) throw new Error("MOT_DE_PASSE_INCORRECT");
  if (motDePasseActuel === nouveauMotDePasse) throw new Error("MOT_DE_PASSE_IDENTIQUE");
  doc.motDePasseHash = await bcrypt.hash(nouveauMotDePasse, 12);
  doc.motDePasseModifieLe = new Date();
  doc.tokenVersion = (doc.tokenVersion ?? 0) + 1;
  await doc.save();
  return { ok: true };
}

export async function updateAvatar(file: Buffer, mime: string): Promise<string> {
  const u = await requireRole("CLIENT", "FOURNISSEUR", "ADMIN");
  if (!["image/png", "image/jpeg", "image/webp"].includes(mime)) throw new Error("INVALID_MIME");
  if (file.byteLength > 2 * 1024 * 1024) throw new Error("TOO_LARGE");
  const webp = await sharp(file).resize(256, 256, { fit: "cover" }).webp().toBuffer();
  const name = `${u.id}-${Date.now()}.webp`;
  const url = await storage.save(webp, name, "image/webp");
  await connectMongoose();
  await User.updateOne({ _id: u.id }, { $set: { avatarUrl: url } });
  return url;
}

export async function getProfilComplet() {
  const u = await requireRole("CLIENT", "FOURNISSEUR", "ADMIN");
  await connectMongoose();
  const doc = await User.findById(u.id);
  if (!doc) throw new Error("NOT_FOUND");
  return {
    avatarUrl: doc.avatarUrl ?? null,
    motDePasseModifieLe: doc.motDePasseModifieLe?.toISOString() ?? null,
    notificationsPrefs: (doc.notificationsPrefs as Record<string, boolean> | undefined) ?? {},
  };
}

export async function enregistrerPreferencesNotifications(prefs: Record<string, boolean>) {
  const u = await requireRole("CLIENT", "FOURNISSEUR", "ADMIN");
  await connectMongoose();
  await User.updateOne({ _id: u.id }, { $set: { notificationsPrefs: prefs } });
  return { ok: true };
}
