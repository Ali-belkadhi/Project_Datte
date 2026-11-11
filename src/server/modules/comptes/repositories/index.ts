// MODULE A — Comptes (Baha Ayadi)
// Implémentations actives des repositories. Pour brancher Prisma :
// créer `*.repository.prisma.ts` et changer la ligne correspondante.
export { utilisateurRepositoryMock as utilisateurRepository } from "./utilisateur.repository.mock";
export { fournisseurRepositoryMock as fournisseurRepository } from "./fournisseur.repository.mock";
export { notificationRepositoryMock as notificationRepository } from "./notification.repository.mock";
export { conversationRepositoryMock as conversationRepository } from "./conversation.repository.mock";
export { adminRepositoryMock as adminRepository } from "./admin.repository.mock";
// TODO(module A) : remplacer par les repositories Prisma

export type { UtilisateurRepository } from "./utilisateur.repository";
export type { FournisseurRepository, CandidatFournisseur } from "./fournisseur.repository";
export type { NotificationRepository } from "./notification.repository";
export type { ConversationRepository } from "./conversation.repository";
export type { AdminRepository } from "./admin.repository";
