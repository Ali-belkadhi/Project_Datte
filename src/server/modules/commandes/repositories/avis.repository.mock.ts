import "server-only";
import { LITIGES } from "@/mocks/admin";
import { AVIS } from "@/mocks/avis";
import { mockDelay } from "@/server/core/mock-delay";
import type { AvisRepository, LitigeRepository } from "./avis.repository";

export const avisRepositoryMock: AvisRepository = {
  async parProduit(produitId) {
    return AVIS.filter((a) => a.produitId === produitId);
  },
  async parFournisseur(fournisseurId) {
    await mockDelay();
    return AVIS.filter((a) => a.fournisseurId === fournisseurId);
  },
};

export const litigeRepositoryMock: LitigeRepository = {
  async lister() {
    await mockDelay();
    return LITIGES;
  },
  async parId(id) {
    return LITIGES.find((l) => l.id === id) ?? null;
  },
};
