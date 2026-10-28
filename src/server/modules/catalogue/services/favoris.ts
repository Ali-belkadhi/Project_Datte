// MODULE B — Catalogue (Ali Belkathi)
import "server-only";
import { getFournisseur, getUtilisateurCourant } from "@/server/contracts/comptes";
import { favoriRepository, produitRepository } from "../repositories";
import { avecVendeurs } from "./produits";

export async function mesFavorisIds() {
  try {
    const u = await getUtilisateurCourant();
    return favoriRepository.produitIds(u.id);
  } catch {
    return [];
  }
}

export async function mesFavoris() {
  const u = await getUtilisateurCourant();
  const [produitIds, fournisseurIds] = await Promise.all([favoriRepository.produitIds(u.id), favoriRepository.fournisseurIds(u.id)]);
  const [produits, boutiques] = await Promise.all([
    produitRepository.parIds(produitIds).then(avecVendeurs),
    Promise.all(fournisseurIds.map(getFournisseur)).then((l) => l.filter((f) => f !== null)),
  ]);
  return { produits, boutiques };
}
