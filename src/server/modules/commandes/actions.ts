"use server";
// MODULE C — Commandes (Karim Ouertatani) — points d'entrée des mutations.
// Chaque action : validation Zod → contrôle du rôle → service (règles métier) → ActionResult.

import { revalidatePath } from "next/cache";
import { runAction } from "@/server/core/action";
import { getAdresses } from "@/server/modules/comptes/services/utilisateurs";
import { NotFoundError } from "@/server/core/errors";
import { getProduitsPourPanier } from "@/server/contracts/catalogue";
import { ligneDepuisProduit, scinderParFournisseur } from "@/lib/panier";
import type { Adresse } from "@/types/domain";
import {
  annulationSchema,
  avisSchema,
  basculeCodePromoSchema,
  checkoutSchema,
  codePromoAdminSchema,
  codePromoSchema,
  expeditionSchema,
  lignePanierSchema,
  litigeSchema,
  majLignePanierSchema,
  refusSousCommandeSchema,
  reponseAvisSchema,
  reprisePaiementSchema,
  resolutionLitigeSchema,
  retraitLignePanierSchema,
  sousCommandeSchema,
  type CheckoutInput,
} from "@/lib/validation/commandes";
import { laisserAvis as _laisserAvis, repondreAvis as _repondreAvis } from "./services/avis";
import { basculerCodePromo as _basculerCode, creerCodePromo as _creerCode, evaluerCodePromo } from "./services/codes-promo";
import {
  accepterColis,
  annulerParClient,
  creerCommande,
  expedierColis,
  livrerColis,
  preparerColis,
  refuserColis,
  reprendrePaiement as _reprendrePaiement,
} from "./services/commandes";
import { ouvrirLitige as _ouvrirLitige, resoudreLitige as _resoudreLitige } from "./services/litiges";
import { ajouterLigne, memoriserCodePromo, modifierLigne, retirerLigne, viderPanier } from "./services/panier";

/* -------------------------------- Panier -------------------------------- */

export async function ajouterAuPanier(input: unknown) {
  return runAction(lignePanierSchema, input, ["CLIENT"], async (d) => ajouterLigne(d), "Ajouté au panier");
}

/** `ligneId` = identifiant du produit (une ligne par produit dans un panier). */
export async function majLignePanier(input: unknown) {
  return runAction(majLignePanierSchema, input, ["CLIENT"], async (d) => {
    await modifierLigne(d.ligneId, { quantiteGrammes: d.quantiteGrammes, quantiteUnites: d.quantiteUnites });
    return { ligneId: d.ligneId };
  }, "Panier mis à jour");
}

export async function retirerDuPanier(input: unknown) {
  return runAction(retraitLignePanierSchema, input, ["CLIENT"], async (d) => {
    await retirerLigne(d.produitId);
    return { produitId: d.produitId };
  }, "Article retiré");
}

/** Vérifie un code promo sur les lignes du panier et le mémorise pour le checkout. */
export async function appliquerCodePromo(input: unknown) {
  return runAction(codePromoSchema, input, ["CLIENT"], async (d) => {
    const lignes = d.lignes ?? [];
    const produits = await getProduitsPourPanier(lignes.map((l) => l.produitId));
    const lignesPanier = lignes.flatMap((l) => {
      const p = produits.find((x) => x.produit.id === l.produitId);
      return p ? [{ id: l.produitId, ...ligneDepuisProduit(p, l) }] : [];
    });
    const r = await evaluerCodePromo(d.code, scinderParFournisseur(lignesPanier));
    await memoriserCodePromo(r.valide ? r.code : null);
    return { code: r.code, valide: r.valide, remise: r.remise, message: r.message };
  });
}

export async function retirerCodePromo() {
  await memoriserCodePromo(null);
}

/* ------------------------------- Checkout ------------------------------- */

/** Adresse enregistrée du client (contrat A) ou adresse saisie / choisie sur la carte au checkout. */
async function adresseDeLivraison(d: CheckoutInput): Promise<{ adresse: Adresse; position?: { latitude: number; longitude: number } }> {
  if (d.adresseLivraison) {
    const { latitude, longitude, ...a } = d.adresseLivraison;
    return {
      adresse: { ...a, id: "adresse-checkout", libelle: latitude !== undefined ? "Adresse choisie sur la carte" : "Adresse de livraison", parDefaut: false },
      position: latitude !== undefined && longitude !== undefined ? { latitude, longitude } : undefined,
    };
  }
  const adresse = (await getAdresses()).find((a) => a.id === d.adresseId);
  if (!adresse) throw new NotFoundError("adresse de livraison");
  return { adresse };
}

/**
 * Crée la commande puis renvoie l'URL de paiement Stripe (carte) ou null (paiement à la livraison).
 * Le panier serveur est vidé : la commande est enregistrée, même si le paiement est abandonné ensuite.
 */
export async function passerCommande(input: unknown) {
  return runAction(checkoutSchema, input, ["CLIENT"], async (d) => {
    const { adresse, position } = await adresseDeLivraison(d);
    const r = await creerCommande({ lignes: d.lignes, adresse, position, livraison: d.livraison, methodePaiement: d.methodePaiement, codePromo: d.codePromo });
    await viderPanier();
    revalidatePath("/compte/commandes");
    return r;
  }, "Commande enregistrée");
}

/** Relance le paiement d'une commande restée « en attente de paiement ». */
export async function reprendrePaiement(input: unknown) {
  return runAction(reprisePaiementSchema, input, ["CLIENT"], async (d) => _reprendrePaiement(d.numero), "Redirection vers le paiement…");
}

/** Annulation par le client (commande entière ou un colis), avec remboursement Stripe automatique. */
export async function annulerCommande(input: unknown) {
  return runAction(annulationSchema, input, ["CLIENT"], async (d) => {
    const r = await annulerParClient(d.numero, d.motif);
    revalidatePath("/compte/commandes");
    return r;
  }, "Commande annulée");
}

/* ------------------------- Sous-commandes (vendeur) ---------------------- */

const revalidateVendeur = (numero: string) => {
  revalidatePath("/vendeur/commandes");
  revalidatePath(`/vendeur/commandes/${numero}`);
  revalidatePath("/vendeur");
};

export async function accepterSousCommande(input: unknown) {
  return runAction(sousCommandeSchema, input, ["FOURNISSEUR"], async (d) => {
    await accepterColis(d.numero);
    revalidateVendeur(d.numero);
    return { numero: d.numero, statut: "ACCEPTEE" as const };
  }, "Commande acceptée");
}

export async function preparerSousCommande(input: unknown) {
  return runAction(sousCommandeSchema, input, ["FOURNISSEUR"], async (d) => {
    await preparerColis(d.numero);
    revalidateVendeur(d.numero);
    return { numero: d.numero, statut: "EN_PREPARATION" as const };
  }, "Commande en préparation");
}

export async function refuserSousCommande(input: unknown) {
  return runAction(refusSousCommandeSchema, input, ["FOURNISSEUR"], async (d) => {
    await refuserColis(d.numero, d.motif);
    revalidateVendeur(d.numero);
    return { numero: d.numero, statut: "REFUSEE" as const };
  }, "Commande refusée — le client est remboursé");
}

export async function expedierSousCommande(input: unknown) {
  return runAction(expeditionSchema, input, ["FOURNISSEUR"], async (d) => {
    await expedierColis(d.numero, d.transporteur, d.numeroSuivi);
    revalidateVendeur(d.numero);
    return { numero: d.numero, statut: "EXPEDIEE" as const };
  }, "Commande expédiée");
}

export async function livrerSousCommande(input: unknown) {
  return runAction(sousCommandeSchema, input, ["FOURNISSEUR"], async (d) => {
    await livrerColis(d.numero);
    revalidateVendeur(d.numero);
    return { numero: d.numero, statut: "LIVREE" as const };
  }, "Livraison confirmée");
}

/* --------------------------------- Avis --------------------------------- */

export async function laisserAvis(input: unknown) {
  return runAction(avisSchema, input, ["CLIENT"], async (d) => {
    const r = await _laisserAvis(d);
    revalidatePath("/compte/commandes");
    return r;
  }, "Merci pour votre avis");
}

export async function repondreAvis(input: unknown) {
  return runAction(reponseAvisSchema, input, ["FOURNISSEUR"], async (d) => {
    const r = await _repondreAvis(d.avisId, d.reponse);
    revalidatePath("/vendeur/avis");
    return r;
  }, "Réponse publiée");
}

/* -------------------------------- Litiges ------------------------------- */

export async function ouvrirLitige(input: unknown) {
  return runAction(litigeSchema, input, ["CLIENT"], async (d) => _ouvrirLitige(d), "Signalement envoyé à l'équipe DEGLA");
}

export async function resoudreLitige(input: unknown) {
  return runAction(resolutionLitigeSchema, input, ["ADMIN"], async (d) => {
    const r = await _resoudreLitige(d);
    revalidatePath("/admin/litiges");
    return r;
  }, "Décision enregistrée");
}

/* ------------------------------ Codes promo ----------------------------- */

export async function creerCodePromo(input: unknown) {
  return runAction(codePromoAdminSchema, input, ["ADMIN"], async (d) => {
    const code = await _creerCode({ ...d, fournisseurId: d.fournisseurId || null, utilisationsMax: d.utilisationsMax ?? null });
    revalidatePath("/admin/codes-promo");
    return { code };
  }, "Code promo créé");
}

export async function basculerCodePromo(input: unknown) {
  return runAction(basculeCodePromoSchema, input, ["ADMIN"], async (d) => {
    await _basculerCode(d.code, d.actif);
    revalidatePath("/admin/codes-promo");
    return d;
  }, "Code promo mis à jour");
}
