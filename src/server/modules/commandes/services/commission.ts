// MODULE C — Commandes (Karim Ouertatani) — commission DEGLA prélevée sur chaque sous-commande.
import "server-only";
import { getFournisseur, getParametresPlateforme } from "@/server/contracts/comptes";

/** Taux de secours si les paramètres de la plateforme sont indisponibles. */
export const TAUX_COMMISSION_DEFAUT = 8; // %

/**
 * Taux de commission (%) d'un fournisseur : Fournisseur.tauxCommission s'il est défini,
 * sinon ParametresPlateforme.tauxCommission (module A), sinon le taux de secours.
 */
export async function tauxCommission(fournisseurId?: string | null): Promise<number> {
  const [f, p] = await Promise.all([
    fournisseurId ? getFournisseur(fournisseurId).catch(() => null) : null,
    getParametresPlateforme().catch(() => null),
  ]);
  return f?.tauxCommission ?? p?.tauxCommission ?? TAUX_COMMISSION_DEFAUT;
}

/** Commission DEGLA sur un montant brut (millimes), au taux donné en %. */
export const calculerCommission = (brut: number, taux: number) => Math.round((brut * taux) / 100);
