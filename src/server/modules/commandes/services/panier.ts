// MODULE C — Commandes (Karim Ouertatani)
import "server-only";
import type { LignePanier } from "@/types/domain";
import { getProduitsPourPanier } from "@/server/contracts/catalogue";
import { getUtilisateurCourant } from "@/server/contracts/comptes";
import { panierRepository } from "../repositories";

/** Panier de démo converti en lignes affichables (via le contrat du module B). */
export async function getPanierDemo(): Promise<LignePanier[]> {
  const u = await getUtilisateurCourant();
  const brutes = await panierRepository.lignes(u.id);
  const produits = await getProduitsPourPanier(brutes.map((l) => l.produitId));
  return brutes.flatMap((l, i) => {
    const item = produits.find((p) => p.produit.id === l.produitId);
    if (!item) return [];
    const { produit: p, vendeur } = item;
    return [
      {
        id: `lp-${i + 1}`,
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
        quantiteGrammes: l.quantiteGrammes,
        quantiteUnites: l.quantiteUnites,
        stockMax: p.typeProduit === "DATTE" ? p.stockGrammes : p.stockUnites,
      },
    ];
  });
}

export { scinderParFournisseur, totauxPanier } from "@/lib/panier";
