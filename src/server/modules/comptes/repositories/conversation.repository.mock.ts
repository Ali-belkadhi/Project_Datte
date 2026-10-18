import "server-only";
import { CONVERSATIONS_CLIENT, CONVERSATIONS_FOURNISSEUR } from "@/mocks/conversations";
import { mockDelay } from "@/server/core/mock-delay";
import type { ConversationRepository } from "./conversation.repository";

export const conversationRepositoryMock: ConversationRepository = {
  async pourUtilisateur(_utilisateurId, role) {
    await mockDelay();
    return role === "FOURNISSEUR" ? CONVERSATIONS_FOURNISSEUR : CONVERSATIONS_CLIENT;
  },
};
