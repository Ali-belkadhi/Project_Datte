// MODULE B — Catalogue (Ali Belkathi)
import "server-only";
import type { FiltresCatalogue, Produit, ProduitAvecVendeur } from "@/types/domain";
import { NotFoundError } from "@/server/core/errors";
import { getFournisseur, getUtilisateurCourant } from "@/server/contracts/comptes";
import { produitRepository } from "../repositories";

/** Associe à chaque produit le minimum de son vendeur (via le contrat du module A). */
export async function avecVendeurs(produits: Produit[]): Promise<ProduitAvecVendeur[]> {
  const ids = [...new Set(produits.map((p) => p.fournisseurId))];
  const vendeurs = new Map(await Promise.all(ids.map(async (id) => [id, await getFournisseur(id)] as const)));
  return produits.flatMap((produit) => {
    const f = vendeurs.get(produit.fournisseurId);
    if (!f) return [];
    return [
      {
        produit,
        vendeur: { id: f.id, slug: f.slug, nomBoutique: f.nomBoutique, verifie: f.verifie, region: f.region, couleur: f.couleur },
      },
    ];
  });
}

export async function listProduits(filtres: FiltresCatalogue = {}) {
  const items = await avecVendeurs(await produitRepository.lister(filtres));
  return filtres.vendeurVerifie ? items.filter((i) => i.vendeur.verifie) : items;
}

export const getProduit = (slug: string) => produitRepository.parSlug(slug);

export async function getProduitAvecVendeur(slug: string) {
  const p = await produitRepository.parSlug(slug);
  if (!p) return null;
  const [item] = await avecVendeurs([p]);
  return item ?? null;
}

export async function getProduitsParIds(ids: string[]) {
  return avecVendeurs(await produitRepository.parIds(ids));
}

/** « Vous aimerez aussi » : même variété ou même type, hors produit courant. */
export async function produitsSimilaires(produit: Produit, limite = 8) {
  const tous = await produitRepository.lister({});
  const proches = tous
    .filter((p) => p.id !== produit.id)
    .sort((a, b) => Number(b.variete === produit.variete) - Number(a.variete === produit.variete) || Number(b.typeProduit === produit.typeProduit) - Number(a.typeProduit === produit.typeProduit));
  return avecVendeurs(proches.slice(0, limite));
}

/** « De saison » : dattes Rtob / Tamr de la récolte 2026. */
export async function produitsDeSaison(limite = 10) {
  const dattes = await produitRepository.lister({ type: "DATTE", maturites: ["RTOB", "TAMR"], tri: "nouveautes" });
  return avecVendeurs(dattes.filter((p) => p.typeProduit === "DATTE" && p.anneeRecolte === 2026).slice(0, limite));
}

export async function produitsParVariete(slug: string) {
  return avecVendeurs(await produitRepository.lister({ varietes: [slug as never] }));
}

export async function produitsParFournisseur(fournisseurId: string) {
  const tous = await produitRepository.parFournisseur(fournisseurId);
  return avecVendeurs(tous.filter((p) => p.statut === "PUBLIE"));
}

/* ------------------------------ Vue vendeur ----------------------------- */

async function monFournisseurId() {
  const u = await getUtilisateurCourant();
  if (!u.fournisseurId) throw new NotFoundError("fournisseur du vendeur courant");
  return u.fournisseurId;
}

export async function mesProduits() {
  return produitRepository.parFournisseur(await monFournisseurId());
}

export async function getMonProduit(id: string) {
  const p = await produitRepository.parId(id);
  return p && p.fournisseurId === (await monFournisseurId()) ? p : null;
}

/** Stock bas : moins de 5 kg (datte) ou de 10 unités (dérivé). */
export function estStockBas(p: Produit) {
  return p.typeProduit === "DATTE" ? p.stockGrammes < 5000 : p.stockUnites < 10;
}

export async function mesProduitsStockBas(limite = 3) {
  const produits = await mesProduits();
  return produits.filter((p) => p.statut !== "BROUILLON" && estStockBas(p)).slice(0, limite);
}

/** Fiche suggérée simulée (IA-B) — remplacée plus tard par app/api/ia/fiche-produit. */
export { FICHE_DEMO as ficheSuggereeDemo } from "../ia/fiche-produit";
