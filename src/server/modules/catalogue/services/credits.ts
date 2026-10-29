// MODULE B — Catalogue (Ali Belkathi)
import "server-only";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { creditsRepository } from "../repositories";

export const listPacksCredits = () => creditsRepository.packs();

export async function monSoldeCredits() {
  const u = await getUtilisateurCourant();
  return creditsRepository.solde(u.fournisseurId ?? "");
}

export async function mesMouvementsCredits() {
  const u = await getUtilisateurCourant();
  return creditsRepository.mouvements(u.fournisseurId ?? "");
}
