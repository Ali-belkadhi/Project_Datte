// MODULE C — webhook Stripe : signature vérifiée + traitement idempotent (un événement n'est traité qu'une fois).
// Événements à activer dans Stripe : checkout.session.completed, checkout.session.expired,
// checkout.session.async_payment_succeeded, checkout.session.async_payment_failed.
import type Stripe from "stripe";
import { stripe } from "@/server/integrations/paiement";
import { traiterEvenementStripe } from "@/server/modules/commandes/services/paiements";

export async function POST(request: Request) {
  const secret = process.env.STRIPE_SECRET_WEBHOOK;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return Response.json({ error: "SIGNATURE_MANQUANTE" }, { status: 400 });

  let evenement: Stripe.Event;
  try {
    // corps BRUT obligatoire pour vérifier la signature
    evenement = await stripe().webhooks.constructEventAsync(await request.text(), signature, secret);
  } catch {
    return Response.json({ error: "SIGNATURE_INVALIDE" }, { status: 400 });
  }

  try {
    const r = await traiterEvenementStripe(evenement);
    return Response.json({ recu: true, ...r });
  } catch (e) {
    console.error("[webhook stripe]", e);
    return Response.json({ error: "INTERNE" }, { status: 500 }); // Stripe renverra l'événement
  }
}
