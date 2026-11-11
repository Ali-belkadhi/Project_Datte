import "server-only";
import { COMMANDES_ACHETEUR, PANIER_DEMO, SOUS_COMMANDES_VENDEUR } from "@/mocks/commandes";
import { mockDelay } from "@/server/core/mock-delay";
import type { CommandeRepository, PanierRepository } from "./commande.repository";

export const commandeRepositoryMock: CommandeRepository = {
  async pourClient() {
    await mockDelay();
    return COMMANDES_ACHETEUR;
  },
  async parNumero(numero) {
    await mockDelay();
    return COMMANDES_ACHETEUR.find((c) => c.numero === numero) ?? null;
  },
  async sousCommandesFournisseur() {
    await mockDelay();
    return SOUS_COMMANDES_VENDEUR;
  },
  async sousCommandeParNumero(numero) {
    await mockDelay();
    return (
      SOUS_COMMANDES_VENDEUR.find((s) => s.numero === numero) ??
      COMMANDES_ACHETEUR.flatMap((c) => c.sousCommandes).find((s) => s.numero === numero) ??
      null
    );
  },
};

export const panierRepositoryMock: PanierRepository = {
  async lignes() {
    return PANIER_DEMO;
  },
};
