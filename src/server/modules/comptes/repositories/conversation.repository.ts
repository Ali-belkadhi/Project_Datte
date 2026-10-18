import "server-only";
import type { Conversation } from "@/types/domain";
import type { Role } from "@/types/enums";

export interface ConversationRepository {
  pourUtilisateur(utilisateurId: string, role: Role): Promise<Conversation[]>;
}
