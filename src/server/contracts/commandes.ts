// CONTRAT — fourni par le MODULE C (Commandes). Signatures stables pour les modules A et B.
import "server-only";
import { fusionnerPanierVisiteur as _fusionner } from "@/server/modules/commandes/services/panier";
import { getPaiement, initierPaiement as _initier, synchroniserSessionStripe } from "@/server/modules/commandes/services/paiements";

export type ObjetPaiement =
  | { type: "COMMANDE"; reference: string }
  | { type: "CREDITS_3D"; reference: string };

/**
 * PaiementService.initier — utilisé par B (achat de crédits 3D).
 * Renvoie `urlPaiement` (page Stripe) vers laquelle rediriger le fournisseur ; retour sur
 * /vendeur/credits?paiement=reussi|annule. Montant en millimes.
 * Callback : à la confirmation (webhook Stripe, idempotent), C appelle
 * `confirmerAchatCredits3D()` du contrat catalogue (module B) avec le statut REUSSI ou ECHOUE.
 */
export const initierPaiement = (montant: number, objet: ObjetPaiement) => _initier(montant, objet, { methode: "CARTE" });

/**
 * Retour de la page Stripe (`?session_id=`) : vérifie la session auprès de Stripe et confirme
 * le paiement (idempotent). Pour B : crédite les crédits 3D même sans webhook configuré.
 */
export async function confirmerRetourPaiement(sessionId: string) {
  const p = await synchroniserSessionStripe(sessionId).catch(() => null);
  return p?.statut ?? null;
}

/** Callback côté B : statut d'un paiement (EN_ATTENTE, REUSSI, ECHOUE, REMBOURSE). */
export async function statutPaiement(reference: string) {
  return (await getPaiement(reference))?.statut ?? null;
}

/** À appeler par A juste après la connexion : fusionne le panier visiteur dans le panier du client (EF-30). */
export const fusionnerPanierVisiteur = (clientId: string) => _fusionner(clientId);
