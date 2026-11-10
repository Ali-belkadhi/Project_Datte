import "server-only";
import { MODELES_3D, MOUVEMENTS_CREDITS, PACKS_CREDITS, SOLDE_CREDITS } from "@/mocks/credits";
import { mockDelay } from "@/server/core/mock-delay";
import type { CreditsRepository, FavoriRepository, Modele3DRepository } from "./modele3d.repository";

export const modele3DRepositoryMock: Modele3DRepository = {
  async parFournisseur() {
    await mockDelay();
    return MODELES_3D;
  },
  async parId(id) {
    await mockDelay();
    return MODELES_3D.find((m) => m.id === id) ?? null;
  },
  async parTaskId() {
    return null;
  },
  async parProduitId(produitId) {
    return MODELES_3D.find((m) => m.produitId === produitId) ?? null;
  },
  async creer(data) {
    return { ...MODELES_3D[0], ...data, id: "m3d-mock" };
  },
  async maj(id, data) {
    const m = MODELES_3D.find((item) => item.id === id);
    return m ? { ...m, ...data } : null;
  },
};

export const creditsRepositoryMock: CreditsRepository = {
  async packs() {
    await mockDelay();
    return PACKS_CREDITS;
  },
  async solde() {
    return SOLDE_CREDITS;
  },
  async mouvements() {
    await mockDelay();
    return MOUVEMENTS_CREDITS;
  },
};

/** Favoris de l'acheteur de démo. */
export const favoriRepositoryMock: FavoriRepository = {
  async produitIds() {
    return ["p06", "p20", "p07", "p12", "p23"];
  },
  async fournisseurIds() {
    return ["f-ben-amor", "f-rob-gabes"];
  },
  async basculer() {
    return true;
  },
};
