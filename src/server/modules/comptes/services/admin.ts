// MODULE A — Comptes (Baha Ayadi)
/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import { connectMongoose } from "@/server/db/mongoose";
import { Fournisseur, JournalAudit, Signalement, User } from "@/server/models";
import { getParametres } from "@/server/services/ParametresService";
import { listFournisseurs } from "@/server/services/FournisseurService";
import type { Signalement as SignalementDomaine } from "@/types/domain";
import type { StatutTraitement } from "@/types/enums";

const CIBLE_LIBELLE: Record<string, string> = {
  PRODUIT: "Produit",
  AVIS: "Avis",
  FOURNISSEUR: "Boutique",
  MESSAGE: "Message",
};

export async function listSignalements(statut?: string): Promise<{ items: SignalementDomaine[]; total: number }> {
  await connectMongoose();
  const q: Record<string, unknown> = {};
  if (statut) q.statut = statut;
  const docs = await Signalement.find(q).populate("auteurId", "prenom nom").sort({ creeLe: -1 }).limit(100);
  const items = docs.map((d: any) => ({
    id: String(d._id),
    cibleType: d.cibleType,
    cibleLibelle: d.cibleLibelle ?? `${CIBLE_LIBELLE[d.cibleType] ?? d.cibleType} · ${d.cibleId}`,
    motif: d.motif,
    auteur: d.auteurId ? `${d.auteurId.prenom ?? ""} ${d.auteurId.nom ?? ""}`.trim() : "—",
    statut: d.statut as StatutTraitement,
    creeLe: (d.creeLe ?? new Date()).toISOString(),
    extrait: d.texteLibre ?? d.motif,
  }));
  return { items, total: items.length };
}

/** Paramètres exposés à l'UI : commission en pourcentage, montants en millimes. */
export async function getParametresPlateforme() {
  const p: any = await getParametres();
  const value = (k: string, fallback = 0) => (typeof p?.[k] === "number" ? p[k] : fallback);
  return {
    tauxCommission: Math.round(value("tauxCommission", 0.08) * 100),
    fraisLivraisonDefaut: value("fraisLivraisonDefaut", 5000),
    livraisonGratuiteDes: value("livraisonGratuiteDes", 0) ?? 0,
    creditsOffertsInscription: value("creditsOffertsInscription", 5),
    coutCreditsImage: value("coutCreditsImage", 1),
    coutCreditsMultiImage: value("coutCreditsMultiImage", 2),
    seuilCreditsBas: value("seuilCreditsBas", 3),
    delaiMax3DMinutes: value("delaiMax3DMinutes", 15),
  };
}

export async function getFileATraiter() {
  await connectMongoose();
  const [enAttente, signalements] = await Promise.all([
    listFournisseurs({ statut: "EN_ATTENTE" }),
    listSignalements("OUVERT"),
  ]);
  return {
    dossiers: enAttente.items.map((f: any) => ({
      id: String(f._id),
      nom: f.nomBoutique ?? "",
      gerant: f.userId ? `${f.userId.prenom ?? ""} ${f.userId.nom ?? ""}`.trim() : "",
      region: f.region ?? "TUNIS",
      soumisLe: (f.createdAt ?? new Date()).toISOString(),
      lien: `/admin/fournisseurs/${f._id}`,
    })),
    signalements: signalements.items,
  };
}

export async function getKpiPlateforme() {
  await connectMongoose();
  const [vendeursActifs, dossiersEnAttente, litigesOuverts] = await Promise.all([
    Fournisseur.countDocuments({ statutVerification: "VERIFIE" }),
    Fournisseur.countDocuments({ statutVerification: "EN_ATTENTE" }),
    Signalement.countDocuments({ statut: "OUVERT" }),
  ]);
  return { vendeursActifs, dossiersEnAttente, litigesOuverts, chiffreAffaires: 0, serie: [] };
}

export async function listJournalAudit(limit = 100) {
  await connectMongoose();
  const docs = await JournalAudit.find().populate("utilisateurId", "prenom nom email").sort({ creeLe: -1 }).limit(limit);
  return docs.map((d: any) => ({
    id: String(d._id),
    action: d.action,
    entite: d.entite,
    entiteId: d.entiteId,
    details: d.details,
    ip: d.ip,
    utilisateur: d.utilisateurId ? `${d.utilisateurId.prenom ?? ""} ${d.utilisateurId.nom ?? ""}`.trim() : "système",
    creeLe: (d.creeLe ?? new Date()).toISOString(),
  }));
}

export async function compterUtilisateurs() {
  await connectMongoose();
  return User.countDocuments();
}
