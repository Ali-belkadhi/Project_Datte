import "server-only";
import { ANALYSES_IA, CANDIDATS_EN_ATTENTE, DOCUMENTS_FOURNISSEURS, DOSSIERS_INFOS } from "@/mocks/admin";
import { FOURNISSEURS } from "@/mocks/fournisseurs";
import { mockDelay } from "@/server/core/mock-delay";
import type { FournisseurRepository } from "./fournisseur.repository";

export const fournisseurRepositoryMock: FournisseurRepository = {
  async lister(filtre) {
    await mockDelay();
    return filtre?.statut ? FOURNISSEURS.filter((f) => f.statutVerification === filtre.statut) : FOURNISSEURS;
  },
  // lectures unitaires sans latence : appelées en rafale par les contrats (cartes produit)
  async parId(id) {
    return FOURNISSEURS.find((f) => f.id === id) ?? null;
  },
  async parSlug(slug) {
    await mockDelay();
    return FOURNISSEURS.find((f) => f.slug === slug) ?? null;
  },
  async dossier(id) {
    await mockDelay();
    const fournisseur = FOURNISSEURS.find((f) => f.id === id);
    const infos = DOSSIERS_INFOS[id];
    if (!fournisseur || !infos) return null;
    return { fournisseur, ...infos, documents: DOCUMENTS_FOURNISSEURS.filter((d) => d.fournisseurId === id) };
  },
  async documents(id) {
    await mockDelay();
    return DOCUMENTS_FOURNISSEURS.filter((d) => d.fournisseurId === id);
  },
  async analyseIA(id) {
    return ANALYSES_IA.find((a) => a.fournisseurId === id) ?? null;
  },
  async candidats() {
    return CANDIDATS_EN_ATTENTE;
  },
};
