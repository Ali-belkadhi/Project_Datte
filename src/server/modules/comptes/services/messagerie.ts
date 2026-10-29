// MODULE A — Comptes (Baha Ayadi)
import "server-only";
import { conversationRepository } from "../repositories";
import { getUtilisateurCourant } from "./utilisateurs";

export async function listConversations() {
  const u = await getUtilisateurCourant();
  return conversationRepository.pourUtilisateur(u.id, u.role);
}
