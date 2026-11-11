// CONTRAT — fourni par le MODULE B (Catalogue), utilisé par C (panier, avis, assistant IA).
import "server-only";
import type { FiltresCatalogue, Produit, ProduitAvecVendeur, Variete } from "@/types/domain";
import { getProduitsParIds, listProduits } from "@/server/modules/catalogue/services/produits";
import { getVariete } from "@/server/modules/catalogue/services/varietes";
import { produitRepository } from "@/server/modules/catalogue/repositories";

/** Produit + vendeur pour construire une ligne de panier. */
export async function getProduitPourPanier(produitId: string): Promise<ProduitAvecVendeur | null> {
  const [item] = await getProduitsParIds([produitId]);
  return item ?? null;
}

export const getProduitsPourPanier = (ids: string[]) => getProduitsParIds(ids);

export async function getProduitBrut(produitId: string): Promise<Produit | null> {
  return produitRepository.parId(produitId);
}

/** TODO(module B) : décrémenter le stock dans une transaction (SELECT … FOR UPDATE). */
export async function reserverStock(_lignes: { produitId: string; quantiteGrammes?: number; quantiteUnites?: number }[]) {
  return { reserve: true as const, demo: true };
}

/** TODO(module B) : restituer le stock (annulation, refus, paiement échoué). */
export async function libererStock(_lignes: { produitId: string; quantiteGrammes?: number; quantiteUnites?: number }[]) {
  return { libere: true as const, demo: true };
}

/** TODO(module B) : recalculer Produit.noteMoyenne / nombreAvis après un avis. */
export async function majNoteProduit(_produitId: string) {
  return { demo: true };
}

export const rechercherProduits = (filtres: FiltresCatalogue): Promise<ProduitAvecVendeur[]> => listProduits(filtres);

export const infosVariete = (slug: string): Promise<Variete | null> => getVariete(slug);
