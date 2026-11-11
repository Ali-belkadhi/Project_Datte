// CONTRAT — fourni par le MODULE C (Commandes), utilisé par B (achat de crédits 3D).
import "server-only";
import { initierPaiement as _initier } from "@/server/modules/commandes/services/paiements";

export type ObjetPaiement =
  | { type: "COMMANDE"; reference: string }
  | { type: "CREDITS_3D"; reference: string };

/** Initie un paiement (Konnect / Flouci). Simulé dans le template. */
export const initierPaiement = (montant: number, objet: ObjetPaiement) => _initier(montant, objet);
