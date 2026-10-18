import "server-only";
import { PRODUITS } from "@/mocks/produits";
import { mockDelay } from "@/server/core/mock-delay";
import { applyFiltres } from "./filtres";
import type { ProduitRepository } from "./produit.repository";

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
};
