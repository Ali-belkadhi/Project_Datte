import "server-only";
import { ADRESSES, UTILISATEUR_ACHETEUR, UTILISATEUR_ADMIN, UTILISATEUR_VENDEUR } from "@/mocks/utilisateurs";
import { mockDelay } from "@/server/core/mock-delay";
import type { UtilisateurRepository } from "./utilisateur.repository";

const TOUS = [UTILISATEUR_ACHETEUR, UTILISATEUR_VENDEUR, UTILISATEUR_ADMIN];

export const utilisateurRepositoryMock: UtilisateurRepository = {
  // pas de latence : appelé à chaque requête par getSession()
  async demoPourZone(zone) {
    if (zone === "vendeur") return UTILISATEUR_VENDEUR;
    if (zone === "admin") return UTILISATEUR_ADMIN;
    return UTILISATEUR_ACHETEUR;
  },
  async parId(id) {
    return TOUS.find((u) => u.id === id) ?? null;
  },
  async adresses() {
    await mockDelay();
    return ADRESSES;
  },
};
