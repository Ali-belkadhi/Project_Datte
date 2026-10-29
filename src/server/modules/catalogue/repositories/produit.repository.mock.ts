import "server-only";
import { PRODUITS } from "@/mocks/produits";
import { mockDelay } from "@/server/core/mock-delay";
import { applyFiltres } from "./filtres";
import type { ProduitRepository } from "./produit.repository";

/**
 * Repository MOCK conservé uniquement comme référence de démonstration (données de `src/mocks`).
 * Il n'est PLUS branché : le catalogue lit MongoDB (voir produit.repository.mongo.ts).
 */
export const produitRepositoryMock: ProduitRepository = {
  async lister(f) {
    await mockDelay();
    return applyFiltres(PRODUITS, f);
  },
  async parSlug(slug) {
    await mockDelay();
    return PRODUITS.find((p) => p.slug === slug) ?? null;
  },
  async parId(id) {
    return PRODUITS.find((p) => p.id === id) ?? null;
  },
  async parIds(ids) {
    return ids.map((id) => PRODUITS.find((p) => p.id === id)).filter((p) => p !== undefined);
  },
  async parFournisseur(id) {
    await mockDelay();
    return PRODUITS.filter((p) => p.fournisseurId === id);
  },
  async creer() {
    throw new Error("Repository mock : écriture non supportée.");
  },
  async maj() {
    throw new Error("Repository mock : écriture non supportée.");
  },
  async supprimer() {
    throw new Error("Repository mock : écriture non supportée.");
  },
};
