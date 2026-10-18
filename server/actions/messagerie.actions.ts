'use server';

/**
 * Module A - Messagerie Server Actions (EF-44)
 */

import { MessagerieService } from '@/server/services/MessagerieService';
import { AdresseService } from '@/server/services/AdresseService';
import { requireClientOrFournisseur } from '@/server/middleware/rbac';
import { Role } from '@/domain/enums';

export interface MessageVue {
  id: string;
  contenu: string;
  expediteurId: string;
  creeLe: string;
  estMoi: boolean;
}

/** Envoie un message dans une conversation */
export async function actionEnvoyerMessage(conversationId: string, contenu: string) {
  const utilisateur = await requireClientOrFournisseur();
  const texte = contenu.trim();
  if (!texte) return { success: false, error: 'Message vide' };

  const role = utilisateur.role as Role;
  const conversation = await MessagerieService.getConversationAcces(
    conversationId,
    utilisateur._id.toString(),
    role
  );
  if (!conversation) return { success: false, error: 'Conversation introuvable' };

  const destinataireId = await MessagerieService.getDestinataireId(conversation, role);
  if (!destinataireId) return { success: false, error: 'Destinataire introuvable' };

  await MessagerieService.envoyerMessage(
    conversationId,
    utilisateur._id.toString(),
    texte,
    destinataireId
  );

  return { success: true };
}

/** Charge les messages d'une conversation (polling V1) */
export async function actionChargerMessages(conversationId: string) {
  const utilisateur = await requireClientOrFournisseur();
  const role = utilisateur.role as Role;

  const conversation = await MessagerieService.getConversationAcces(
    conversationId,
    utilisateur._id.toString(),
    role
  );
  if (!conversation) return { success: false, messages: [] as MessageVue[] };

  const messages = await MessagerieService.getMessages(conversationId, 1, 100);
  const utilisateurId = utilisateur._id.toString();

  const vues: MessageVue[] = messages
    .map((m) => ({
      id: m._id.toString(),
      contenu: m.contenu,
      expediteurId: m.expediteurId.toString(),
      creeLe: new Date(m.creeLe).toISOString(),
      estMoi: m.expediteurId.toString() === utilisateurId,
    }))
    .reverse();

  return { success: true, messages: vues };
}

/** Marque les messages d'une conversation comme lus */
export async function actionMarquerLus(conversationId: string) {
  const utilisateur = await requireClientOrFournisseur();
  await MessagerieService.marquerMessagesLus(conversationId, utilisateur._id.toString());
  return { success: true };
}

/** Démarre (ou récupère) une conversation client ↔ fournisseur */
export async function actionDemarrerConversation(fournisseurId: string, produitId?: string) {
  const utilisateur = await requireClientOrFournisseur();
  if (utilisateur.role !== Role.CLIENT) {
    return { success: false, error: 'Seuls les clients peuvent contacter un vendeur' };
  }

  const clientId = await AdresseService.getClientId(utilisateur._id.toString());
  const conversation = await MessagerieService.getOuCreerConversation(
    clientId,
    fournisseurId,
    produitId
  );

  return { success: true, conversationId: conversation._id.toString() };
}
