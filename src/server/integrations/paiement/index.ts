// MODULE C — passerelles de paiement.
// Stripe est la passerelle active (carte bancaire). Konnect / Flouci restent des stubs typés.
import "server-only";

export type CreationPaiement = {
  montant: number; // millimes
  reference: string;
  description: string;
  urlRetour: string;
  urlWebhook: string;
};

export type ResultatCreation = { idExterne: string; urlPaiement: string };

export interface PasserellePaiement {
  nom: "KONNECT" | "FLOUCI";
  creerPaiement(p: CreationPaiement): Promise<ResultatCreation>;
  verifierPaiement(idExterne: string): Promise<{ statut: "REUSSI" | "ECHOUE" | "EN_ATTENTE" }>;
}

export { stripe, DEVISE_STRIPE, TAUX_TND_VERS_DEVISE, millimesVersCentimes, urlApp } from "./stripe";
export { konnect } from "./konnect";
export { flouci } from "./flouci";
