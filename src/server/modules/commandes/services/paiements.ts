// MODULE C — Commandes (Karim Ouertatani)
import "server-only";
import { randomUUID } from "node:crypto";
import type { ObjetPaiement } from "@/server/contracts/commandes";
import { getDb } from "@/server/core/mongo";
import type { MethodePaiement, StatutPaiement } from "@/types/enums";

export type PaiementDoc = {
  reference: string;
  objet: ObjetPaiement;
  montant: number; // millimes
  methode: MethodePaiement;
  statut: StatutPaiement;
  creeLe: Date;
  majLe: Date;
};

const paiements = async () => (await getDb()).collection<PaiementDoc>("paiements");

/**
 * Crée un paiement EN_ATTENTE et renvoie l'URL où envoyer l'acheteur.
 * Aujourd'hui : page de paiement interne /commande/paiement (passerelle simulée).
 * TODO(module C) : appeler la vraie passerelle (integrations/paiement) et renvoyer son URL ;
 * la confirmation arrivera par app/api/webhooks/paiement → confirmerPaiement().
 */
export async function initierPaiement(montant: number, objet: ObjetPaiement, methode: MethodePaiement = "KONNECT") {
  const reference = `PAY-${randomUUID()}`;
  const now = new Date();
  await (await paiements()).insertOne({ reference, objet, montant, methode, statut: "EN_ATTENTE", creeLe: now, majLe: now });
  return { reference, montant, statut: "EN_ATTENTE" as const, urlPaiement: `/commande/paiement?ref=${reference}` };
}

export async function getPaiement(reference: string) {
  return (await paiements()).findOne({ reference }, { projection: { _id: 0 } });
}

/** Point unique de confirmation (page simulée aujourd'hui, webhook de la passerelle demain). */
export async function confirmerPaiement(reference: string, statut: "REUSSI" | "ECHOUE") {
  const p = await (await paiements()).findOneAndUpdate(
    { reference, statut: "EN_ATTENTE" },
    { $set: { statut, majLe: new Date() } },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  if (!p) return null;
  if (p.objet.type === "COMMANDE") {
    const { majStatutCommande } = await import("./commandes");
    await majStatutCommande(p.objet.reference, statut === "REUSSI" ? "PAYEE" : "ANNULEE");
  }
  return p;
}
