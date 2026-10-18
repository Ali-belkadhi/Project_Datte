/**
 * DEGLA - Central Model Exports
 * Module A - Baha Ayadi
 */

// Module A - Comptes et Profils (A1)
export { Utilisateur, type IUtilisateur } from './Utilisateur';
export { JetonSecurite, TypeJeton, type IJetonSecurite } from './JetonSecurite';
export { CodeOtp, FinaliteOtp, type ICodeOtp } from './CodeOtp';
export { Client, type IClient } from './Client';
export { Adresse, type IAdresse } from './Adresse';
export { Fournisseur, type IFournisseur } from './Fournisseur';
export { DocumentFournisseur, type IDocumentFournisseur } from './DocumentFournisseur';
export { Administrateur, type IAdministrateur } from './Administrateur';

// Module A - Communication et Administration (A2)
export { Notification, type INotification } from './Notification';
export { AbonnementPush, type IAbonnementPush } from './AbonnementPush';
export { Conversation, type IConversation } from './Conversation';
export { Message, type IMessage } from './Message';
export { Signalement, type ISignalement } from './Signalement';
export { ParametresPlateforme, type IParametresPlateforme } from './ParametresPlateforme';
export { JournalAudit, type IJournalAudit } from './JournalAudit';

// TODO: Module B - Ali Belkathi
// Export Variete, CategorieDerive, Produit, etc.

// TODO: Module C - Karim Ouertatani
// Export Panier, Commande, Paiement, etc.
