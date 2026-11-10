"use server";
// MODULE A — Comptes (Baha Ayadi) — points d'entrée des mutations
// Chaque action : Zod (lib/validation/comptes) → requireRole → service → ActionResult.
// Dans le template, les services ne persistent rien : réponse simulée `{ ok: true }`.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { runAction } from "@/server/core/action";
import { mockDelay } from "@/server/core/mock-delay";
import {
  adresseSchema,
  boutiqueSchema,
  connexionSchema,
  decisionFournisseurSchema,
  inscriptionSchema,
  messageSchema,
  motDePasseOublieSchema,
  notificationsPrefsSchema,
  onboardingSchema,
  otpSchema,
  parametresSchema,
  profilSchema,
  refusFournisseurSchema,
} from "@/lib/validation/comptes";
import { getAnalyseDocuments } from "./services/fournisseurs";

const TOUS = ["CLIENT", "FOURNISSEUR", "ADMIN"] as const;

/* ------------------------------- Auth (UI) ------------------------------ */

export async function inscrire(input: unknown) {
  // TODO(module A) : créer Utilisateur (+ Client ou Fournisseur), envoyer l'OTP (integrations/sms)
  return runAction(inscriptionSchema, input, [...TOUS], async (d) => ({ redirection: `/inscription/verification?role=${d.role}` }), "Compte créé (démo)");
}

export async function connecter(input: unknown) {
  // TODO(module A) : signIn("credentials") d'Auth.js
  return runAction(connexionSchema, input, [...TOUS], async () => ({ redirection: "/compte" }), "Connexion simulée (démo)");
}

export async function verifierOtp(input: unknown) {
  return runAction(otpSchema, input, [...TOUS], async () => ({ verifie: true }), "Numéro vérifié (démo)");
}

export async function demanderReinitialisation(input: unknown) {
  // TODO(module A) : jeton de réinitialisation + e-mail (integrations/email/resend)
  return runAction(motDePasseOublieSchema, input, [...TOUS], async () => ({ envoye: true }), "Lien envoyé (démo)");
}

/* -------------------------------- Profil -------------------------------- */

export async function majProfil(input: unknown) {
  return runAction(profilSchema, input, ["CLIENT", "FOURNISSEUR"], async () => {
    revalidatePath("/compte/profil");
    return { id: "u-demo" };
  });
}

export async function ajouterAdresse(input: unknown) {
  return runAction(adresseSchema, input, ["CLIENT"], async (d) => {
    revalidatePath("/compte/adresses");
    return { id: "adr-demo-" + d.libelle.toLowerCase().replace(/\s+/g, "-") };
  });
}

export async function marquerNotificationLue(input: unknown) {
  return runAction(z.object({ id: z.string() }), input, ["CLIENT", "FOURNISSEUR"], async (d) => ({ id: d.id }), "Notification lue");
}

export async function majPreferencesNotifications(input: unknown) {
  return runAction(notificationsPrefsSchema, input, ["CLIENT", "FOURNISSEUR"], async () => ({}));
}

export async function envoyerMessage(input: unknown) {
  // TODO(module A) : créer Message, notifier l'interlocuteur (NOUVEAU_MESSAGE)
  return runAction(messageSchema, input, ["CLIENT", "FOURNISSEUR"], async (d) => ({ id: `msg-${d.conversationId}-demo` }), "Message envoyé (démo)");
}

/* ------------------------------- Vendeur -------------------------------- */

export async function soumettreOnboarding(input: unknown) {
  // TODO(module A) : créer Fournisseur (EN_ATTENTE) + DocumentFournisseur, lancer analyserDocuments
  return runAction(onboardingSchema, input, ["FOURNISSEUR"], async () => ({ statut: "EN_ATTENTE" as const }), "Dossier soumis (démo)");
}

export async function majBoutique(input: unknown) {
  return runAction(boutiqueSchema, input, ["FOURNISSEUR"], async () => {
    revalidatePath("/vendeur/boutique");
    return { slug: "palmeraie-ben-amor" };
  });
}

/* -------------------------------- Admin --------------------------------- */

export async function validerFournisseur(input: unknown) {
  // TODO(module A) : statutVerification = VERIFIE, JournalAudit, notifier(FOURNISSEUR_VALIDE)
  return runAction(decisionFournisseurSchema, input, ["ADMIN"], async (d) => {
    revalidatePath("/admin/fournisseurs");
    return { id: d.fournisseurId };
  }, "Fournisseur validé (démo)");
}

export async function demanderComplement(input: unknown) {
  return runAction(decisionFournisseurSchema, input, ["ADMIN"], async (d) => ({ id: d.fournisseurId }), "Demande envoyée (démo)");
}

export async function refuserFournisseur(input: unknown) {
  return runAction(refusFournisseurSchema, input, ["ADMIN"], async (d) => ({ id: d.fournisseurId }), "Dossier refusé (démo)");
}

export async function traiterSignalement(input: unknown) {
  return runAction(
    z.object({ id: z.string(), decision: z.enum(["MASQUER", "REJETER", "AVERTIR"]) }),
    input,
    ["ADMIN"],
    async (d) => ({ id: d.id }),
    "Signalement traité (démo)",
  );
}

export async function majParametres(input: unknown) {
  return runAction(parametresSchema, input, ["ADMIN"], async () => {
    revalidatePath("/admin/parametres");
    return {};
  });
}

/** IA-A : (re)lance l'analyse des documents. Simulée : 2 s puis le même résultat. */
export async function analyserDocuments(input: unknown) {
  return runAction(z.object({ fournisseurId: z.string() }), input, ["ADMIN"], async (d) => {
    await mockDelay(2000);
    // TODO(module A) : appeler ia/analyse-documents.ts (generateText + Output.object)
    return getAnalyseDocuments(d.fournisseurId);
  }, "Analyse relancée (démo)");
}
