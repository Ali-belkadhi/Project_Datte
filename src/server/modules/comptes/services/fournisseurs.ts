// MODULE A — Comptes (Baha Ayadi)
import "server-only";
import type { StatutVerification } from "@/types/enums";
import { NotFoundError } from "@/server/core/errors";
import { fournisseurRepository } from "../repositories";
import { getUtilisateurCourant } from "./utilisateurs";

export const listFournisseurs = (statut?: StatutVerification) => fournisseurRepository.lister({ statut });
export const getFournisseur = (id: string) => fournisseurRepository.parId(id);
export const getFournisseurParSlug = (slug: string) => fournisseurRepository.parSlug(slug);
export const getDossierFournisseur = (id: string) => fournisseurRepository.dossier(id);
export const getAnalyseDocuments = (id: string) => fournisseurRepository.analyseIA(id);
export const listCandidats = () => fournisseurRepository.candidats();

/** Boutiques vérifiées, triées par note (accueil, « Boutiques vérifiées »). */
export async function listBoutiquesVerifiees(limite = 4) {
  const tous = await fournisseurRepository.lister({ statut: "VERIFIE" });
  return [...tous].sort((a, b) => b.noteMoyenne - a.noteMoyenne).slice(0, limite);
}

/** Boutique du vendeur connecté (vue vendeur). */
export async function getMaBoutique() {
  const u = await getUtilisateurCourant();
  const f = u.fournisseurId ? await fournisseurRepository.parId(u.fournisseurId) : null;
  if (!f) throw new NotFoundError("boutique du vendeur courant");
  return f;
}

export async function estFournisseurVerifie(id: string) {
  const f = await fournisseurRepository.parId(id);
  return f?.statutVerification === "VERIFIE";
}
