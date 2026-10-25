// MODULE C — Commandes (Karim Ouertatani) — PaiementService générique (commandes + crédits 3D du module B).
import "server-only";
import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import type { ObjetPaiement } from "@/server/contracts/commandes";
import { DEVISE_STRIPE, TAUX_TND_VERS_DEVISE, millimesVersCentimes, stripe, urlApp } from "@/server/integrations/paiement";
import type { MethodePaiement } from "@/types/enums";
import { db, SANS_ID, type PaiementDoc } from "../repositories/mongo";

export type { PaiementDoc };

type OptionsPaiement = {
  methode?: MethodePaiement;
  description?: string;
  email?: string;
  /** Chemins de retour (par défaut : pages de confirmation / d'annulation des commandes). */
  succes?: string;
  annulation?: string;
};

const DUREE_SESSION_MIN = 30; // minimum imposé par Stripe

/**
 * Crée un paiement EN_ATTENTE.
 *  - CARTE (et KONNECT / FLOUCI, redirigés vers Stripe en attendant leur intégration) : session Stripe Checkout,
 *    l'acheteur est redirigé vers `urlPaiement` (page sécurisée Stripe, aucune donnée de carte chez nous) ;
 *  - A_LA_LIVRAISON : aucun appel externe, le paiement passe à REUSSI à la livraison.
 */
export async function initierPaiement(montant: number, objet: ObjetPaiement, options: OptionsPaiement = {}) {
  const methode = options.methode ?? "CARTE";
  const reference = `PAY-${randomUUID()}`;
  const now = new Date();
  const doc: PaiementDoc = { reference, objet, montant, methode, statut: "EN_ATTENTE", montantRembourse: 0, creeLe: now, majLe: now };

  if (methode !== "A_LA_LIVRAISON") {
    const libelle = options.description ?? (objet.type === "COMMANDE" ? `Commande DEGLA ${objet.reference}` : `Crédits 3D DEGLA — ${objet.reference}`);
    const succes = options.succes ?? (objet.type === "COMMANDE" ? `/commande/confirmation?numero=${objet.reference}` : "/vendeur/credits?paiement=reussi");
    const annulation = options.annulation ?? (objet.type === "COMMANDE" ? `/commande/paiement-annule?numero=${objet.reference}` : "/vendeur/credits?paiement=annule");
    const sep = (u: string) => (u.includes("?") ? "&" : "?");
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      client_reference_id: reference,
      customer_email: options.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: DEVISE_STRIPE,
            unit_amount: millimesVersCentimes(montant),
            product_data: { name: libelle, description: `Montant : ${(montant / 1000).toFixed(3)} DT` },
          },
        },
      ],
      metadata: { reference, objetType: objet.type, objetReference: objet.reference },
      payment_intent_data: { metadata: { reference } },
      expires_at: Math.floor(Date.now() / 1000) + DUREE_SESSION_MIN * 60,
      success_url: `${urlApp()}${succes}${sep(succes)}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${urlApp()}${annulation}`,
    });
    doc.referenceExterne = session.id;
    doc.urlPaiement = session.url ?? undefined;
  }

  await (await db.paiements()).insertOne(doc);
  return { reference, montant, statut: doc.statut, urlPaiement: doc.urlPaiement ?? null };
}

export async function getPaiement(reference: string) {
  return (await db.paiements()).findOne({ reference }, SANS_ID);
}

/**
 * Point UNIQUE de confirmation (webhook Stripe, retour sur la page de succès, livraison d'un paiement à la livraison).
 * Idempotent : seul un paiement EN_ATTENTE change d'état, un second appel ne fait rien.
 */
export async function confirmerPaiement(
  reference: string,
  statut: "REUSSI" | "ECHOUE",
  extra: { paymentIntent?: string; reponseBrute?: unknown } = {},
) {
  const p = await (await db.paiements()).findOneAndUpdate(
    { reference, statut: "EN_ATTENTE" },
    { $set: { statut, majLe: new Date(), ...(statut === "REUSSI" ? { payeLe: new Date() } : {}), ...extra } },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  if (!p) return null;
  if (p.objet.type === "COMMANDE") {
    const { surPaiementCommande } = await import("./commandes");
    await surPaiementCommande(p.objet.reference, p.reference, statut);
  } else if (statut === "REUSSI") {
    // TODO(module B) : créditer le fournisseur (MouvementCredit3D ACHAT) — voir contrat statutPaiement().
  }
  return p;
}

/** Vérifie une session Stripe (retour sur la page de succès) : utile quand le webhook n'est pas encore arrivé. */
export async function synchroniserSessionStripe(sessionId: string) {
  const session = await stripe().checkout.sessions.retrieve(sessionId);
  const reference = session.metadata?.reference ?? session.client_reference_id;
  if (!reference) return null;
  if (session.payment_status === "paid") return confirmerPaiement(reference, "REUSSI", { paymentIntent: idIntent(session) });
  if (session.status === "expired") return confirmerPaiement(reference, "ECHOUE");
  return getPaiement(reference);
}

const idIntent = (s: Stripe.Checkout.Session) => (typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id);

/** Traite un événement Stripe déjà vérifié (signature). Idempotent par identifiant d'événement. */
export async function traiterEvenementStripe(evt: Stripe.Event) {
  try {
    await (await db.evenementsStripe()).insertOne({ _id: evt.id, type: evt.type, recuLe: new Date() });
  } catch {
    return { deja: true };
  }
  switch (evt.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const s = evt.data.object;
      const ref = s.metadata?.reference ?? s.client_reference_id;
      if (ref && s.payment_status === "paid") await confirmerPaiement(ref, "REUSSI", { paymentIntent: idIntent(s), reponseBrute: { evenement: evt.id, type: evt.type } });
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const s = evt.data.object;
      const ref = s.metadata?.reference ?? s.client_reference_id;
      if (ref) await confirmerPaiement(ref, "ECHOUE", { reponseBrute: { evenement: evt.id, type: evt.type } });
      break;
    }
  }
  return { deja: false };
}

/**
 * Rembourse (tout ou partie) le paiement réussi d'une commande. Montant en millimes.
 * Carte : remboursement Stripe réel. Paiement à la livraison : enregistré seulement (remboursement manuel).
 */
export async function rembourserCommande(commandeNumero: string, montant: number) {
  if (montant <= 0) return { rembourse: 0 };
  const paiements = await db.paiements();
  const p = await paiements.findOne({ "objet.type": "COMMANDE", "objet.reference": commandeNumero, statut: { $in: ["REUSSI", "REMBOURSE"] } });
  if (!p) return { rembourse: 0 }; // rien n'a été encaissé
  const restant = p.montant - p.montantRembourse;
  const aRembourser = Math.min(montant, restant);
  if (aRembourser <= 0) return { rembourse: 0 };
  if (p.methode !== "A_LA_LIVRAISON" && p.paymentIntent) {
    const centimes = Math.round((aRembourser / 1000) * TAUX_TND_VERS_DEVISE * 100);
    if (centimes > 0) await stripe().refunds.create({ payment_intent: p.paymentIntent, amount: centimes, metadata: { reference: p.reference, commande: commandeNumero } });
  }
  const total = p.montantRembourse + aRembourser;
  await paiements.updateOne({ reference: p.reference }, { $set: { montantRembourse: total, statut: total >= p.montant ? "REMBOURSE" : "REUSSI", majLe: new Date() } });
  return { rembourse: aRembourser };
}

/** Paiement à la livraison : encaissé quand la commande est livrée. */
export async function encaisserALaLivraison(commandeNumero: string) {
  const p = await (await db.paiements()).findOne({ "objet.reference": commandeNumero, methode: "A_LA_LIVRAISON", statut: "EN_ATTENTE" });
  if (p) await (await db.paiements()).updateOne({ reference: p.reference }, { $set: { statut: "REUSSI", payeLe: new Date(), majLe: new Date() } });
}
