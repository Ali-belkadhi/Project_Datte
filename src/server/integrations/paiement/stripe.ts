// MODULE C — Stripe (paiement par carte). Clé secrète lue UNIQUEMENT côté serveur.
import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/** Client Stripe partagé. Lève une erreur claire si la clé secrète manque. */
export function stripe(): Stripe {
  if (client) return client;
  const cle = process.env.STRIPE_CLE_SECRETE;
  if (!cle) throw new Error("STRIPE_CLE_SECRETE manquante : ajoutez-la dans .env.local.");
  client = new Stripe(cle);
  return client;
}

/**
 * Stripe ne propose pas le dinar tunisien (TND) : le montant est converti dans la devise
 * configurée (EUR par défaut) avec un taux fixe. Les montants DEGLA restent en millimes.
 */
export const DEVISE_STRIPE = (process.env.STRIPE_DEVISE ?? "eur").toLowerCase();
export const TAUX_TND_VERS_DEVISE = Number(process.env.STRIPE_TAUX_TND ?? 0.3);

/** millimes TND → plus petite unité de la devise Stripe (centimes). Minimum Stripe : 50 centimes. */
export function millimesVersCentimes(millimes: number) {
  return Math.max(50, Math.round((millimes / 1000) * TAUX_TND_VERS_DEVISE * 100));
}

/** URL publique de l'application (redirections Stripe). */
export const urlApp = () => (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
