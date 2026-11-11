/**
 * Règles pures du panier — partagées entre le service (module C) et le récapitulatif client.
 * Règle métier : la commande est SCINDÉE par fournisseur (une sous-commande chacun),
 * avec ses propres frais de livraison (offerts au-delà du seuil).
 */
import type { LignePanier } from "@/types/domain";
import { LIVRAISON } from "./constants";
import { totalLigne } from "./format";

export type GroupePanier = {
  fournisseurId: string;
  fournisseurNom: string;
  fournisseurVerifie: boolean;
  lignes: LignePanier[];
  sousTotal: number;
  frais: number;
  /** Montant restant avant la livraison offerte (0 si atteinte). */
  resteAvantGratuite: number;
};

export function scinderParFournisseur(lignes: LignePanier[]): GroupePanier[] {
  const groupes = new Map<string, LignePanier[]>();
  for (const l of lignes) groupes.set(l.fournisseurId, [...(groupes.get(l.fournisseurId) ?? []), l]);
  return [...groupes.entries()].map(([fournisseurId, ls]) => {
    const sousTotal = ls.reduce((a, l) => a + totalLigne(l.prix, l.quantiteGrammes, l.quantiteUnites), 0);
    const frais = sousTotal >= LIVRAISON.gratuiteDes ? 0 : LIVRAISON.standard.prix;
    return {
      fournisseurId,
      fournisseurNom: ls[0].fournisseurNom,
      fournisseurVerifie: ls[0].fournisseurVerifie,
      lignes: ls,
      sousTotal,
      frais,
      resteAvantGratuite: Math.max(0, LIVRAISON.gratuiteDes - sousTotal),
    };
  });
}

export function totauxPanier(lignes: LignePanier[], remise = 0) {
  const groupes = scinderParFournisseur(lignes);
  const sousTotal = groupes.reduce((a, g) => a + g.sousTotal, 0);
  const livraison = groupes.reduce((a, g) => a + g.frais, 0);
  return { groupes, sousTotal, livraison, remise, total: Math.max(0, sousTotal + livraison - remise) };
}

/** Construit une ligne de panier (instantané d'affichage) depuis un produit + son vendeur. */
export function ligneDepuisProduit(
  { produit: p, vendeur }: import("@/types/domain").ProduitAvecVendeur,
  quantite: { quantiteGrammes?: number; quantiteUnites?: number },
): Omit<LignePanier, "id"> {
  return {
    produitId: p.id,
    slug: p.slug,
    nom: p.nom,
    typeProduit: p.typeProduit,
    variete: p.variete,
    visuel: p.visuel.type,
    fournisseurId: vendeur.id,
    fournisseurNom: vendeur.nomBoutique,
    fournisseurVerifie: vendeur.verifie,
    prix: p.typeProduit === "DATTE" ? p.prixParKg : p.prixUnitaire,
    stockMax: p.typeProduit === "DATTE" ? p.stockGrammes : p.stockUnites,
    ...(p.typeProduit === "DATTE" ? { quantiteGrammes: quantite.quantiteGrammes ?? 1000 } : { quantiteUnites: quantite.quantiteUnites ?? 1 }),
  };
}
