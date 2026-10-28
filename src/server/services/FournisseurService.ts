/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { connectMongoose } from "@/server/db/mongoose";
import { Fournisseur, DocumentFournisseur } from "@/server/models";
import { encryptRib } from "@/server/utils/rib";
import { requireRole } from "@/lib/auth/rbac";
import { OnboardingStep1Schema, RibSchema } from "@/lib/zod/fournisseur";

export class FournisseurError extends Error {
  constructor(public code: string, message?: string) {
    super(message ?? code);
    this.name = "FournisseurError";
  }
}

const ALLOWED: Record<string, string[]> = {
  EN_ATTENTE: ["VERIFIE", "REFUSE", "SUSPENDU"],
  REFUSE: ["EN_ATTENTE"],
  SUSPENDU: ["VERIFIE"],
  VERIFIE: ["SUSPENDU"],
};

export async function getFournisseurByUser(userId: string) {
  await connectMongoose();
  return Fournisseur.findOne({ userId });
}

export async function getFournisseur(id: string) {
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  await connectMongoose();
  return Fournisseur.findById(id).populate("userId", "prenom nom email telephone");
}

export async function getFournisseurBySlug(slug: string) {
  await connectMongoose();
  return Fournisseur.findOne({ slug }).populate("userId", "prenom nom email telephone");
}

export async function estFournisseurVerifie(id: string): Promise<boolean> {
  if (!/^[a-f0-9]{24}$/i.test(id)) return false;
  await connectMongoose();
  const f = await Fournisseur.findById(id);
  return !!f && f.statutVerification === "VERIFIE";
}

export async function requireFournisseurVerifie() {
  const u = await requireRole("FOURNISSEUR");
  await connectMongoose();
  const f = await Fournisseur.findOne({ userId: u.id });
  if (!f || f.statutVerification !== "VERIFIE") {
    throw new FournisseurError("NOT_VERIFIED", "Fournisseur non vérifié.");
  }
  return { user: u, fournisseur: f };
}

export async function saveOnboardingStep1(userId: string, input: unknown) {
  const parsed = OnboardingStep1Schema.safeParse(input);
  if (!parsed.success) throw new FournisseurError("VALIDATION", "Données invalides");
  await connectMongoose();
  let f = await Fournisseur.findOne({ userId });
  if (!f) f = await Fournisseur.create({ userId, statutVerification: "EN_ATTENTE" });
  // lock sensitive fields if verified
  if (f.statutVerification === "VERIFIE") throw new FournisseurError("LOCKED", "Profil vérifié, modification verrouillée.");
  const data = parsed.data;
  const slug = data.slug ?? data.nomBoutique.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  // unique slug check
  const existing = await (Fournisseur as any).findOne({ slug, _id: { $ne: (f as any)._id } });
  if (existing) throw new FournisseurError("SLUG_TAKEN", "Ce slug est déjà utilisé.");
  f.nomBoutique = data.nomBoutique;
  f.slug = slug;
  f.type = data.type;
  f.region = data.region;
  f.adresseExploitation = data.adresseExploitation;
  f.description = data.description;
  f.matriculeFiscal = data.matriculeFiscal;
  f.numeroRNE = data.numeroRNE;
  f.onboardingStep = Math.max(f.onboardingStep ?? 0, 1);
  await f.save();
  return f;
}

export async function saveRib(userId: string, input: unknown) {
  const parsed = RibSchema.safeParse(input);
  if (!parsed.success) throw new FournisseurError("VALIDATION", "RIB invalide");
  await connectMongoose();
  const f = await Fournisseur.findOne({ userId });
  if (!f) throw new FournisseurError("NOT_FOUND", "Fournisseur introuvable");
  if (f.statutVerification === "VERIFIE") throw new FournisseurError("LOCKED", "Verrouillé");
  f.ribEncrypted = encryptRib(parsed.data.rib);
  f.onboardingStep = Math.max(f.onboardingStep ?? 0, 2);
  await f.save();
  return f;
}

/** Derniers 4 chiffres du RIB du vendeur connecté (jamais le RIB complet). */
export async function getRibMasque(userId: string) {
  await connectMongoose();
  const f = await Fournisseur.findOne({ userId }).select("ribEncrypted statutVerification");
  return {
    last4: f?.ribEncrypted?.last4 ?? null,
    statutVerification: f?.statutVerification ?? null,
  };
}

/**
 * Modification du RIB par le vendeur. Un changement sur un compte vérifié
 * repasse le dossier en attente de vérification (contrôle humain).
 */
export async function modifierRib(userId: string, rib: string) {
  const parsed = RibSchema.safeParse({ rib });
  if (!parsed.success) throw new FournisseurError("VALIDATION", "RIB invalide");
  await connectMongoose();
  const f = await Fournisseur.findOne({ userId });
  if (!f) throw new FournisseurError("NOT_FOUND", "Fournisseur introuvable");
  f.ribEncrypted = encryptRib(parsed.data.rib);
  if (f.statutVerification === "VERIFIE") f.statutVerification = "EN_ATTENTE";
  await f.save();
  return { last4: f.ribEncrypted.last4, statutVerification: f.statutVerification };
}

/** Mise en pause / reprise / fermeture de la boutique par son propriétaire. */
export async function changerEtatBoutique(userId: string, etat: "PAUSE" | "REPRENDRE" | "FERMER") {
  await connectMongoose();
  const f = await Fournisseur.findOne({ userId });
  if (!f) throw new FournisseurError("NOT_FOUND", "Fournisseur introuvable");
  if (etat === "PAUSE" || etat === "FERMER") {
    if (f.statutVerification !== "VERIFIE") throw new FournisseurError("INVALID_TRANSITION", "Seule une boutique vérifiée peut être mise en pause.");
    f.statutVerification = "SUSPENDU";
    f.motifRefus = etat === "FERMER" ? "Fermeture demandée par le vendeur" : "Mise en pause par le vendeur";
  } else {
    if (f.statutVerification !== "SUSPENDU") throw new FournisseurError("INVALID_TRANSITION", "La boutique n'est pas en pause.");
    f.statutVerification = "VERIFIE";
    f.motifRefus = undefined;
  }
  await f.save();
  return { statutVerification: f.statutVerification };
}

export async function submitOnboarding(userId: string) {
  await connectMongoose();
  const f = await Fournisseur.findOne({ userId });
  if (!f) throw new FournisseurError("NOT_FOUND", "Fournisseur introuvable");
  if (!f.nomBoutique || !f.slug) throw new FournisseurError("INCOMPLETE", "Informations manquantes");
  if (!f.ribEncrypted) throw new FournisseurError("INCOMPLETE", "RIB manquant");
  // docs required: CIN, RNE, PATENTE
  const docs = await DocumentFournisseur.find({ fournisseurId: f._id });
  const types = docs.map((d) => d.type);
  for (const t of ["CIN", "RNE", "PATENTE"]) {
    if (!types.includes(t as never)) throw new FournisseurError("INCOMPLETE", `Document ${t} manquant`);
  }
  f.statutVerification = "EN_ATTENTE";
  f.onboardingComplete = true;
  f.onboardingStep = 3;
  f.motifRefus = undefined;
  f.soumisLe = new Date();
  await f.save();
  return f;
}

export async function transitionStatut(fournisseurId: string, next: "VERIFIE" | "REFUSE" | "SUSPENDU" | "EN_ATTENTE", motif?: string, _adminId?: string) {
  await connectMongoose();
  const f = await Fournisseur.findById(fournisseurId);
  if (!f) throw new FournisseurError("NOT_FOUND", "Fournisseur introuvable");
  const allowed = ALLOWED[f.statutVerification] ?? [];
  if (!allowed.includes(next)) throw new FournisseurError("INVALID_TRANSITION", `Transition ${f.statutVerification} -> ${next} non autorisée`);
  f.statutVerification = next;
  if (next === "VERIFIE") {
    f.verifieLe = new Date();
    f.motifRefus = undefined;
  }
  if (next === "REFUSE") {
    f.motifRefus = motif;
  }
  if (next === "SUSPENDU") {
    f.motifRefus = motif;
  }
  if (next === "EN_ATTENTE") {
    f.motifRefus = undefined;
  }
  await f.save();
  return f;
}

export async function updateShopProfile(
  userId: string,
  input: { nomBoutique?: string; description?: string; couleur?: string; region?: string; delaiExpedition?: string; logoUrl?: string; bannerUrl?: string },
) {
  await connectMongoose();
  const f = await Fournisseur.findOne({ userId });
  if (!f) throw new FournisseurError("NOT_FOUND", "Fournisseur introuvable");
  if (input.nomBoutique) f.nomBoutique = input.nomBoutique;
  if (input.description !== undefined) f.description = input.description;
  if (input.couleur) f.couleur = input.couleur;
  if (input.region) f.region = input.region;
  if (input.delaiExpedition) f.delaiExpedition = input.delaiExpedition;
  if (input.logoUrl) f.logoUrl = input.logoUrl;
  if (input.bannerUrl) f.bannerUrl = input.bannerUrl;

  // Generate a slug from nomBoutique if one is not yet set
  if (!f.slug && f.nomBoutique) {
    const base = f.nomBoutique
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    // ensure uniqueness by appending a short suffix if needed
    let candidate = base;
    let attempt = 0;
    while (await (Fournisseur as any).findOne({ slug: candidate, _id: { $ne: (f as any)._id } })) {
      attempt++;
      candidate = `${base}-${attempt}`;
    }
    f.slug = candidate;
  }

  await f.save();
  return f;
}

export async function listFournisseurs(filter: { statut?: string; q?: string; page?: number; limit?: number }) {
  await connectMongoose();
  const page = filter.page ?? 1;
  const limit = filter.limit ?? 20;
  const query: Record<string, unknown> = {};
  if (filter.statut) query.statutVerification = filter.statut;
  if (filter.q) query.nomBoutique = { $regex: filter.q, $options: "i" };
  const total = await Fournisseur.countDocuments(query);
  const items = await Fournisseur.find(query)
    .populate("userId", "prenom nom email telephone")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  return { items, total, page, limit };
}

/** Dernières analyses IA des documents d'un fournisseur. */
export async function getAnalyseDocuments(fournisseurId: string) {
  await connectMongoose();
  const docs = await DocumentFournisseur.find({ fournisseurId });
  return docs
    .filter((d) => d.analyseIA)
    .map((d) => ({ documentId: String(d._id), type: d.type, nomFichier: d.nomFichier, analyse: d.analyseIA }));
}