import "server-only";
import { REPONSE_GENERIQUE, SCENARIOS_ASSISTANT, SUGGESTIONS_ASSISTANT } from "@/mocks/assistant-script";
import type { AssistantRepository } from "./ventes.repository";

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
