// MODULE C — Commandes (Karim Ouertatani)
import "server-only";
import type { ObjetPaiement } from "@/server/contracts/commandes";

/**
 * Initie un paiement. SIMULÉ dans le template : aucune requête vers Konnect / Flouci.
 * TODO(module C) : integrations/paiement → creerPaiement() puis redirection vers l'URL de paiement ;
 * la confirmation arrive par le webhook app/api/webhooks/paiement.
 */
export async function initierPaiement(montant: number, objet: ObjetPaiement) {
  return {
    reference: `PAY-DEMO-${objet.reference}`,
    montant,
    statut: "REUSSI" as const,
    urlPaiement: null,
    demo: true,
  };
}
