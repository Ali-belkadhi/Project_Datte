// MODULE C — interface commune des passerelles de paiement. Stub typé.
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

export { konnect } from "./konnect";
export { flouci } from "./flouci";
