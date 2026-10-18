// MODULE C — Commandes (Karim Ouertatani)
import "server-only";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { ventesRepository } from "../repositories";

export const TAUX_COMMISSION = 8; // % — miroir de ParametresPlateforme.tauxCommission

export async function mesVersements() {
  const u = await getUtilisateurCourant();
  const versements = await ventesRepository.versements(u.fournisseurId ?? "");
  const prochain = versements.find((v) => v.statut === "PLANIFIE") ?? null;
  const totalVerse = versements.filter((v) => v.statut === "EFFECTUE").reduce((a, v) => a + v.montantNet, 0);
  return { versements, prochain, totalVerse };
}

/** Commission DEGLA sur un montant brut (millimes). */
export const calculerCommission = (brut: number) => Math.round((brut * TAUX_COMMISSION) / 100);
