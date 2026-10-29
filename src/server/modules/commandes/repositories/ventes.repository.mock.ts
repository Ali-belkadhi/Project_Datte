import "server-only";
import { VENTES_PLATEFORME } from "@/mocks/admin";
import { REPONSE_GENERIQUE, SCENARIOS_ASSISTANT, SUGGESTIONS_ASSISTANT } from "@/mocks/assistant-script";
import { REPARTITION_VARIETES, TOP_PRODUITS, VENTES_12M, VENTES_30J, VERSEMENTS } from "@/mocks/ventes";
import { mockDelay } from "@/server/core/mock-delay";
import type { AssistantRepository, VentesRepository } from "./ventes.repository";

export const ventesRepositoryMock: VentesRepository = {
  async serieQuotidienne() {
    await mockDelay();
    return VENTES_30J;
  },
  async serieMensuelle() {
    return VENTES_12M;
  },
  async topProduits() {
    return TOP_PRODUITS;
  },
  async repartitionVarietes() {
    return REPARTITION_VARIETES;
  },
  async versements() {
    await mockDelay();
    return VERSEMENTS;
  },
  async seriePlateforme() {
    await mockDelay();
    return VENTES_PLATEFORME;
  },
};

export const assistantRepositoryMock: AssistantRepository = {
  async scenarios() {
    return SCENARIOS_ASSISTANT;
  },
  async suggestions() {
    return SUGGESTIONS_ASSISTANT;
  },
  async reponseGenerique() {
    return REPONSE_GENERIQUE;
  },
};
