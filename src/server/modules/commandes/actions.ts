"use server";
// MODULE C — Commandes (Karim Ouertatani) — points d'entrée des mutations

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/core/action";
import { libererStock, majNoteProduit, reserverStock } from "@/server/contracts/catalogue";
import { notifier } from "@/server/contracts/comptes";
import {
  annulationSchema,
  avisSchema,
  checkoutSchema,
  codePromoSchema,
  confirmationPaiementSchema,
  expeditionSchema,
  lignePanierSchema,
  litigeSchema,
  majLignePanierSchema,
  refusSousCommandeSchema,
  reponseAvisSchema,
  resolutionLitigeSchema,
  sousCommandeSchema,
} from "@/lib/validation/commandes";
import { getAdresses } from "@/server/modules/comptes/services/utilisateurs";
import { NotFoundError } from "@/server/core/errors";
import { creerCommande, lierPaiement } from "./services/commandes";
import { confirmerPaiement, initierPaiement } from "./services/paiements";

/* -------------------------------- Panier -------------------------------- */

export async function ajouterAuPanier(input: unknown) {
  // TODO(module C) : upsert LignePanier (panier visiteur via sessionId, fusion à la connexion)
  return runAction(lignePanierSchema, input, ["CLIENT"], async (d) => ({ produitId: d.produitId }), "Ajouté au panier");
}

export async function majLignePanier(input: unknown) {
  return runAction(majLignePanierSchema, input, ["CLIENT"], async (d) => ({ ligneId: d.ligneId }), "Panier mis à jour");
}

export async function appliquerCodePromo(input: unknown) {
  // TODO(module C) : CodePromo.estValide(panier) + calculerRemise(montant)
  return runAction(codePromoSchema, input, ["CLIENT"], async (d) => {
    const valide = d.code === "DEGLA10";
    return { code: d.code, valide, remisePourcentage: valide ? 10 : 0 };
  }, "Code appliqué (démo)");
}

/* ------------------------------- Checkout ------------------------------- */

export async function passerCommande(input: unknown) {
  return runAction(checkoutSchema, input, ["CLIENT"], async (d) => {
    const adresse = (await getAdresses()).find((a) => a.id === d.adresseId);
    if (!adresse) throw new NotFoundError("Adresse introuvable.");
    const commande = await creerCommande({ lignes: d.lignes, adresse, livraison: d.livraison, methodePaiement: d.methodePaiement });
    if (d.methodePaiement === "A_LA_LIVRAISON") {
      return { numero: commande.numero, urlPaiement: null };
    }
    const paiement = await initierPaiement(commande.total, { type: "COMMANDE", reference: commande.numero }, d.methodePaiement);
    await lierPaiement(commande.numero, paiement.reference);
    revalidatePath("/compte/commandes");
    return { numero: commande.numero, urlPaiement: paiement.urlPaiement };
  }, "Commande enregistrée");
}

/** Confirmation depuis la page de paiement simulée (remplacée par le webhook de la vraie passerelle). */
export async function confirmerPaiementSimule(input: unknown) {
  return runAction(confirmationPaiementSchema, input, ["CLIENT"], async (d) => {
    const p = await confirmerPaiement(d.reference, d.statut);
    if (!p) throw new NotFoundError("Paiement introuvable ou déjà traité.");
    revalidatePath("/compte/commandes");
    return { numero: p.objet.reference, statut: p.statut };
  }, input && (input as { statut?: string }).statut === "ECHOUE" ? "Paiement annulé" : "Paiement réussi");
}

export async function annulerCommande(input: unknown) {
  return runAction(annulationSchema, input, ["CLIENT"], async (d) => {
    await libererStock([]);
    revalidatePath("/compte/commandes");
    return { numero: d.numero };
  }, "Commande annulée (démo)");
}

/* ------------------------- Sous-commandes (vendeur) ---------------------- */

export async function accepterSousCommande(input: unknown) {
  return runAction(sousCommandeSchema, input, ["FOURNISSEUR"], async (d) => {
    await notifier("u-sarra", "COMMANDE_STATUT", { numero: d.numero, statut: "ACCEPTEE" });
    revalidatePath("/vendeur/commandes");
    return { numero: d.numero, statut: "ACCEPTEE" as const };
  }, "Commande acceptée (démo)");
}

export async function preparerSousCommande(input: unknown) {
  return runAction(sousCommandeSchema, input, ["FOURNISSEUR"], async (d) => ({ numero: d.numero, statut: "EN_PREPARATION" as const }), "Commande en préparation (démo)");
}

export async function refuserSousCommande(input: unknown) {
  return runAction(refusSousCommandeSchema, input, ["FOURNISSEUR"], async (d) => {
    await libererStock([]);
    return { numero: d.numero, statut: "REFUSEE" as const };
  }, "Commande refusée (démo)");
}

export async function expedierSousCommande(input: unknown) {
  return runAction(expeditionSchema, input, ["FOURNISSEUR"], async (d) => {
    await notifier("u-sarra", "COMMANDE_STATUT", { numero: d.numero, statut: "EXPEDIEE", suivi: d.numeroSuivi });
    return { numero: d.numero, statut: "EXPEDIEE" as const };
  }, "Commande expédiée (démo)");
}

/* --------------------------------- Avis --------------------------------- */

export async function laisserAvis(input: unknown) {
  return runAction(avisSchema, input, ["CLIENT"], async (d) => {
    await majNoteProduit(d.ligneCommandeId);
    return { id: "av-demo" };
  }, "Merci pour votre avis (démo)");
}

export async function repondreAvis(input: unknown) {
  return runAction(reponseAvisSchema, input, ["FOURNISSEUR"], async (d) => ({ avisId: d.avisId }), "Réponse publiée (démo)");
}

/* -------------------------------- Litiges ------------------------------- */

export async function ouvrirLitige(input: unknown) {
  return runAction(litigeSchema, input, ["CLIENT"], async () => ({ numero: "LIT-2026-0043" }), "Signalement envoyé (démo)");
}

export async function resoudreLitige(input: unknown) {
  return runAction(resolutionLitigeSchema, input, ["ADMIN"], async (d) => {
    revalidatePath("/admin/litiges");
    return { id: d.litigeId, statut: d.decision };
  }, "Décision enregistrée (démo)");
}
