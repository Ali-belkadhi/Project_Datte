// MODULE C — Commandes (Karim Ouertatani)
import "server-only";
import type { StatutSousCommande } from "@/types/enums";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { commandeRepository } from "../repositories";

export async function mesCommandes() {
  const u = await getUtilisateurCourant();
  return commandeRepository.pourClient(u.id);
}

export const getCommande = (numero: string) => commandeRepository.parNumero(numero);

export async function derniereCommande() {
  const commandes = await mesCommandes();
  return commandes[0] ?? null;
}

/* ------------------------------ Vue vendeur ----------------------------- */

export async function sousCommandesRecues() {
  const u = await getUtilisateurCourant();
  return commandeRepository.sousCommandesFournisseur(u.fournisseurId ?? "");
}

export const getSousCommande = (numero: string) => commandeRepository.sousCommandeParNumero(numero);

/** Compteurs par statut pour les onglets « Commandes reçues ». */
export async function compteursSousCommandes() {
  const toutes = await sousCommandesRecues();
  const c: Partial<Record<StatutSousCommande | "TOUTES", number>> = { TOUTES: toutes.length };
  for (const s of toutes) c[s.statut] = (c[s.statut] ?? 0) + 1;
  return c;
}

export async function commandesATraiter(limite = 4) {
  const toutes = await sousCommandesRecues();
  return toutes.filter((s) => s.statut === "EN_ATTENTE" || s.statut === "ACCEPTEE").slice(0, limite);
}

/** Transitions autorisées depuis un statut (règle métier du cycle de vie). */
export function actionsPossibles(statut: StatutSousCommande) {
  switch (statut) {
    case "EN_ATTENTE":
      return ["accepter", "refuser"] as const;
    case "ACCEPTEE":
      return ["preparer"] as const;
    case "EN_PREPARATION":
      return ["expedier", "bordereau"] as const;
    case "EXPEDIEE":
      return ["bordereau"] as const;
    default:
      return [] as const;
  }
}
