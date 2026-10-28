// MODULE C — Commandes (Karim Ouertatani)
import "server-only";
import type { KpiVentes, PointVentes } from "@/types/domain";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { ventesRepository } from "../repositories";

const somme = (s: PointVentes[], k: "chiffreAffaires" | "commandes") => s.reduce((a, p) => a + p[k], 0);
const variation = (actuel: number, precedent: number) =>
  precedent === 0 ? 0 : Math.round(((actuel - precedent) / precedent) * 1000) / 10;

/** KPIs du tableau de bord vendeur, calculés à partir des séries (règle métier). */
export async function kpisVendeur(periode: KpiVentes["periode"] = "30j"): Promise<KpiVentes> {
  const u = await getUtilisateurCourant();
  const id = u.fournisseurId ?? "";
  const quotidien = await ventesRepository.serieQuotidienne(id);
  const serie = periode === "12m" ? await ventesRepository.serieMensuelle(id) : periode === "7j" ? quotidien.slice(-7) : quotidien;
  const ca = somme(serie, "chiffreAffaires");
  const commandes = somme(serie, "commandes");
  // période précédente simulée : -8 % de CA, -5 % de commandes
  const caPrec = Math.round(ca / 1.124);
  const cmdPrec = Math.round(commandes / 1.061);
  return {
    periode,
    serie,
    chiffreAffaires: ca,
    variationCA: variation(ca, caPrec),
    commandes,
    variationCommandes: variation(commandes, cmdPrec),
    panierMoyen: commandes ? Math.round(ca / commandes) : 0,
    variationPanier: variation(ca / commandes, caPrec / cmdPrec),
    noteMoyenne: 4.8,
    variationNote: 2.1,
  };
}

export async function topProduitsVendeur() {
  const u = await getUtilisateurCourant();
  return ventesRepository.topProduits(u.fournisseurId ?? "");
}

export async function repartitionVarietesVendeur() {
  const u = await getUtilisateurCourant();
  return ventesRepository.repartitionVarietes(u.fournisseurId ?? "");
}

export const seriePlateforme = () => ventesRepository.seriePlateforme();
