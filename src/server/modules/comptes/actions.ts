"use server";
// MODULE A — Comptes (Baha Ayadi) — points d'entrée des mutations.
// Chaque action : Zod → contrôle de rôle → service → ActionResult.
// Aucune réponse simulée : tout est persisté en base.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { ok, fail } from "@/server/core/action-result";
import type { ActionResult } from "@/types/action-result";
import {
  adresseSchema,
  boutiqueSchema,
  changementMotDePasseSchema,
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

import { signIn } from "@/auth";
import { registerUser, verifyEmail, requestPasswordReset, resendVerification } from "@/server/services/AuthService";
import { changerMotDePasse, enregistrerPreferencesNotifications, updateProfile } from "@/server/services/ProfileService";
import { createAddress, deleteAddress, setDefaultAddress, updateAddress } from "@/server/services/AddressService";
import {
  marquerNotificationLue as marquerNotificationLueService,
  marquerToutesNotificationsLues,
  notifier,
  supprimerNotification,
} from "./services/notifications";
import { envoyerMessage as envoyerMessageService } from "@/server/services/MessagerieService";
import { getUtilisateurCourant, requireRole } from "@/lib/auth/rbac";
import { connectMongoose } from "@/server/db/mongoose";
import { Fournisseur, User } from "@/server/models";

/* ------------------------------- Auth (UI) ------------------------------ */

export async function inscrire(input: unknown): Promise<ActionResult<{ redirection: string }>> {
  const parsed = inscriptionSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  const d = parsed.data;
  try {
    await registerUser({
      prenom: d.prenom,
      nom: d.nom,
      email: d.email,
      motDePasse: d.motDePasse,
      role: d.role,
      langue: "FR",
    });
    return ok({ redirection: `/inscription/verification?email=${encodeURIComponent(d.email)}` }, "Compte créé.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    if (msg === "EMAIL_EXISTS") return fail("VALIDATION", undefined, "Cet e-mail est déjà utilisé.");
    return fail("INTERNE", undefined, msg);
  }
}

export async function connecter(input: unknown): Promise<ActionResult<{ redirection: string }>> {
  const parsed = connexionSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const res = await signIn("credentials", { email: parsed.data.email, motDePasse: parsed.data.motDePasse, redirect: false });
    if (res && (res as { error?: string }).error) {
      return fail("FORBIDDEN", (res as { error?: string }).error, "Identifiants invalides ou compte non vérifié.");
    }
    return ok({ redirection: "/compte" }, "Connecté.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    return fail("FORBIDDEN", msg, "Identifiants invalides ou compte non vérifié.");
  }
}

export async function verifierOtp(input: unknown): Promise<ActionResult<{ verifie: boolean }>> {
  const parsed = otpSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Code invalide");
  const v = await verifyEmail(parsed.data.email, parsed.data.code);
  if (!v) return fail("VALIDATION", undefined, "Code incorrect ou expiré.");
  return ok({ verifie: true }, "E-mail vérifié.");
}

export async function renvoyerCodeVerification(input: unknown): Promise<ActionResult<{ envoye: boolean }>> {
  const parsed = motDePasseOublieSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "E-mail invalide");
  await resendVerification(parsed.data.email);
  return ok({ envoye: true }, "Nouveau code envoyé.");
}

export async function demanderReinitialisation(input: unknown): Promise<ActionResult<{ envoye: boolean }>> {
  const parsed = motDePasseOublieSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "E-mail invalide");
  await requestPasswordReset(parsed.data.email);
  return ok({ envoye: true }, "Si ce compte existe, un code a été envoyé.");
}

/* -------------------------------- Profil -------------------------------- */

export async function majProfil(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = profilSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const u = await getUtilisateurCourant();
    await updateProfile({
      prenom: parsed.data.prenom,
      nom: parsed.data.nom,
      langue: parsed.data.langue,
      telephone: parsed.data.telephone,
    });
    revalidatePath("/compte/profil");
    return ok({ id: u.id }, "Profil mis à jour.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    if (msg === "TELEPHONE_EXISTS") return fail("VALIDATION", undefined, "Ce numéro est déjà utilisé.");
    return fail("FORBIDDEN", undefined, msg);
  }
}

export async function changerMotDePasseAction(input: unknown): Promise<ActionResult<{ ok: boolean }>> {
  const parsed = changementMotDePasseSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    await changerMotDePasse(parsed.data.motDePasseActuel, parsed.data.nouveauMotDePasse);
    revalidatePath("/compte/profil");
    return ok({ ok: true }, "Mot de passe modifié. Reconnectez-vous sur vos autres appareils.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    if (msg === "MOT_DE_PASSE_INCORRECT") return fail("VALIDATION", undefined, "Mot de passe actuel incorrect.");
    if (msg === "MOT_DE_PASSE_IDENTIQUE") return fail("VALIDATION", undefined, "Choisissez un mot de passe différent.");
    return fail("INTERNE", undefined, msg);
  }
}

export async function marquerToutesNotificationsLuesAction(): Promise<ActionResult<{ ok: boolean }>> {
  try {
    await marquerToutesNotificationsLues();
    revalidatePath("/compte/notifications");
    return ok({ ok: true }, "Notifications marquées comme lues.");
  } catch {
    return fail("INTERNE");
  }
}

export async function supprimerNotificationAction(id: string): Promise<ActionResult<{ ok: boolean }>> {
  try {
    await supprimerNotification(id);
    revalidatePath("/compte/notifications");
    return ok({ ok: true }, "Notification supprimée.");
  } catch {
    return fail("INTERNE");
  }
}

/* -------------------------------- Adresses ------------------------------- */

export async function ajouterAdresse(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = adresseSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const u = await getUtilisateurCourant();
    const id = await createAddress(u.id, parsed.data);
    revalidatePath("/compte/adresses");
    return ok({ id }, "Adresse ajoutée.");
  } catch (e) {
    return fail("FORBIDDEN", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function modifierAdresse(id: string, input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = z.object({ id: z.string(), data: adresseSchema }).safeParse({ id, data: input });
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const u = await getUtilisateurCourant();
    await updateAddress(u.id, parsed.data.id, parsed.data.data);
    revalidatePath("/compte/adresses");
    return ok({ id: parsed.data.id }, "Adresse mise à jour.");
  } catch (e) {
    return fail("FORBIDDEN", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function supprimerAdresse(id: string): Promise<ActionResult<{ ok: boolean }>> {
  try {
    const u = await getUtilisateurCourant();
    await deleteAddress(u.id, id);
    revalidatePath("/compte/adresses");
    return ok({ ok: true }, "Adresse supprimée.");
  } catch (e) {
    return fail("FORBIDDEN", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function definirAdresseParDefaut(id: string): Promise<ActionResult<{ ok: boolean }>> {
  try {
    const u = await getUtilisateurCourant();
    await setDefaultAddress(u.id, id);
    revalidatePath("/compte/adresses");
    return ok({ ok: true }, "Adresse par défaut mise à jour.");
  } catch (e) {
    return fail("FORBIDDEN", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

/* ------------------------------ Notifications ---------------------------- */

export async function marquerNotificationLue(input: unknown) {
  const parsed = z.object({ id: z.string() }).safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    await marquerNotificationLueService(parsed.data.id);
    return ok({ id: parsed.data.id }, "Notification lue.");
  } catch {
    return fail("INTERNE");
  }
}

export async function majPreferencesNotifications(input: unknown) {
  const parsed = notificationsPrefsSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    await enregistrerPreferencesNotifications(parsed.data);
    revalidatePath("/vendeur/parametres");
    return ok({ ok: true }, "Préférences enregistrées.");
  } catch {
    return fail("INTERNE");
  }
}

/* -------------------------------- Messages ------------------------------- */

export async function demarrerConversation(input: unknown) {
  const parsed = z
    .object({ fournisseurId: z.string().min(1), produitId: z.string().optional() })
    .safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const u = await getUtilisateurCourant();
    const { demarrerConversation: service } = await import("@/server/services/MessagerieService");
    const conv = await service(u.id, parsed.data);
    revalidatePath("/compte/messages");
    return ok({ id: String((conv as any)._id) }, "Conversation ouverte.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur";
    const message =
      msg === "FOURNISSEUR_NON_VERIFIE"
        ? "Cette boutique n'est pas vérifiée."
        : msg === "FOURNISSEUR_HORS_LIGNE"
          ? "Cette fiche boutique n'est pas encore rattachée à un compte vendeur : la messagerie n'est pas disponible."
          : msg;
    return fail("FORBIDDEN", undefined, message);
  }
}

export async function envoyerMessage(input: unknown) {
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const u = await getUtilisateurCourant();
    const msg = await envoyerMessageService(u.id, parsed.data);
    revalidatePath("/compte/messages");
    revalidatePath("/vendeur/messages");
    return ok({ id: String((msg as any)._id) }, "Message envoyé.");
  } catch (e) {
    return fail("FORBIDDEN", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

/* ------------------------------- Vendeur -------------------------------- */

export async function soumettreOnboarding(input: unknown) {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const u = await getUtilisateurCourant();
    const FS = await import("@/server/services/FournisseurService");
    await connectMongoose();
    const doc = await FS.saveOnboardingStep1(u.id, {
      nomBoutique: parsed.data.nomBoutique,
      type: parsed.data.type,
      region: parsed.data.region,
      adresseExploitation: parsed.data.adresseExploitation,
      description: parsed.data.description,
    });
    await FS.saveRib(u.id, { rib: parsed.data.rib });
    // Les documents ont été envoyés via /api/uploads ; on vérifie leur présence réelle.
    const { DocumentFournisseur } = await import("@/server/models");
    const types = parsed.data.documents.map((d) => d.type);
    const presents = await DocumentFournisseur.find({ fournisseurId: doc._id, type: { $in: types } }).distinct("type");
    const manquants = ["CIN", "RNE", "PATENTE"].filter((t) => !presents.includes(t as never));
    if (manquants.length) return fail("VALIDATION", undefined, `Documents manquants : ${manquants.join(", ")}`);
    await FS.submitOnboarding(u.id);
    const { notifierAdmins } = await import("@/server/services/NotificationService");
    await notifierAdmins("NOUVELLE_DEMANDE_FOURNISSEUR", { fournisseurId: String(doc._id) });
    revalidatePath("/vendeur/onboarding");
    return ok({ statut: "EN_ATTENTE" as const }, "Dossier soumis. Notre équipe le vérifie sous 24 à 48 h.");
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function majBoutique(input: unknown) {
  const parsed = boutiqueSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const u = await getUtilisateurCourant();
    const FS = await import("@/server/services/FournisseurService");
    const f = await FS.updateShopProfile(u.id, {
      nomBoutique: parsed.data.nomBoutique,
      description: parsed.data.description,
      couleur: parsed.data.couleur,
      region: parsed.data.region,
      delaiExpedition: parsed.data.delaiExpedition,
      logoUrl: parsed.data.logoUrl,
      bannerUrl: parsed.data.bannerUrl,
    });
    revalidatePath("/vendeur/boutique");
    revalidatePath(`/boutique/${(f as any).slug ?? ""}`);
    return ok({ slug: (f as any).slug ?? "" }, "Boutique mise à jour.");
  } catch (e) {
    return fail("FORBIDDEN", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function majRib(input: unknown) {
  const parsed = z.object({ rib: z.string().regex(/^\d{20}$/, "Le RIB doit comporter 20 chiffres.") }).safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "RIB invalide");
  try {
    const u = await getUtilisateurCourant();
    const FS = await import("@/server/services/FournisseurService");
    const res = await FS.modifierRib(u.id, parsed.data.rib);
    const { notifierAdmins } = await import("@/server/services/NotificationService");
    if (res.statutVerification === "EN_ATTENTE") {
      await notifierAdmins("NOUVELLE_DEMANDE_FOURNISSEUR", { motif: "RIB modifié" });
    }
    revalidatePath("/vendeur/parametres");
    return ok(res, "RIB enregistré.");
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function changerEtatBoutiqueAction(input: unknown) {
  const parsed = z.object({ etat: z.enum(["PAUSE", "REPRENDRE", "FERMER"]) }).safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const u = await getUtilisateurCourant();
    const FS = await import("@/server/services/FournisseurService");
    const res = await FS.changerEtatBoutique(u.id, parsed.data.etat);
    revalidatePath("/vendeur/parametres");
    revalidatePath("/vendeur");
    return ok(res, parsed.data.etat === "REPRENDRE" ? "Boutique réactivée." : "Boutique mise en pause.");
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

/* -------------------------------- Admin --------------------------------- */

export async function validerFournisseur(input: unknown) {
  const parsed = decisionFournisseurSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  const { actionApproveFournisseur } = await import("@/server/actions/admin");
  const res = await actionApproveFournisseur(parsed.data);
  revalidatePath("/admin/fournisseurs");
  revalidatePath(`/admin/fournisseurs/${parsed.data.fournisseurId}`);
  revalidatePath("/admin");
  return res;
}

export async function demanderComplement(input: unknown) {
  const parsed = decisionFournisseurSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    await requireRole();
    await connectMongoose();
    const f = await Fournisseur.findById(parsed.data.fournisseurId);
    if (!f) return fail("NOT_FOUND");
    await notifier(String(f.userId), "FOURNISSEUR_REFUSE", {
      motif: parsed.data.motif ?? "Merci de compléter votre dossier.",
    });
    revalidatePath("/admin/fournisseurs");
    revalidatePath(`/admin/fournisseurs/${parsed.data.fournisseurId}`);
    return ok({ id: parsed.data.fournisseurId }, "Demande de complément envoyée.");
  } catch (e) {
    return fail("INTERNE", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function refuserFournisseur(input: unknown) {
  const parsed = refusFournisseurSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Motif requis");
  const { actionRefuseFournisseur } = await import("@/server/actions/admin");
  const res = await actionRefuseFournisseur(parsed.data);
  revalidatePath("/admin/fournisseurs");
  revalidatePath(`/admin/fournisseurs/${parsed.data.fournisseurId}`);
  revalidatePath("/admin");
  return res;
}

export async function traiterSignalement(input: unknown) {
  const parsed = z
    .object({ id: z.string(), decision: z.enum(["MASQUER", "REJETER", "AVERTIR"]) })
    .safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const u = await getUtilisateurCourant();
    const { traiterSignalement: service } = await import("@/server/services/SignalementService");
    await service(
      parsed.data.id,
      parsed.data.decision === "AVERTIR" ? "TRAITE" : parsed.data.decision,
      parsed.data.decision === "AVERTIR" ? "Avertissement envoyé à l'auteur." : undefined,
      u.id,
    );
    revalidatePath("/admin/moderation");
    return ok({ id: parsed.data.id }, "Signalement traité.");
  } catch (e) {
    return fail("INTERNE", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

export async function majParametres(input: unknown) {
  const parsed = parametresSchema.safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const u = await getUtilisateurCourant();
    const { updateParametres, invalidateParametresCache } = await import("@/server/services/ParametresService");
    await updateParametres(
      {
        tauxCommission: parsed.data.tauxCommission / 100,
        fraisLivraisonDefaut: parsed.data.fraisLivraisonDefaut,
        livraisonGratuiteDes: parsed.data.livraisonGratuiteDes,
        creditsOffertsInscription: parsed.data.creditsOffertsInscription,
        coutCreditsImage: parsed.data.coutCreditsImage,
        coutCreditsMultiImage: parsed.data.coutCreditsMultiImage,
      },
      u.id,
    );
    invalidateParametresCache();
    revalidatePath("/admin/parametres");
    return ok({ ok: true }, "Paramètres enregistrés.");
  } catch (e) {
    return fail("INTERNE", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

/** IA-A : (re)lance l'analyse des documents via OpenRouter. */
export async function analyserDocuments(input: unknown) {
  const parsed = z.object({ fournisseurId: z.string() }).safeParse(input);
  if (!parsed.success) return fail("VALIDATION", parsed.error.flatten(), "Données invalides");
  try {
    const u = await getUtilisateurCourant();
    const isAdmin = u.role === "ADMIN";
    await (await import("@/server/services/AnalyseDocumentsService")).analyserDocuments(parsed.data.fournisseurId, u.id, isAdmin);
    revalidatePath(`/admin/fournisseurs/${parsed.data.fournisseurId}`);
    return ok({ ok: true }, "Analyse relancée.");
  } catch (e) {
    return fail("VALIDATION", undefined, e instanceof Error ? e.message : "Erreur");
  }
}

/** Utilitaire interne : nombre d'utilisateurs (KPI admin). */
export async function compterUtilisateursAction() {
  await connectMongoose();
  return ok({ total: await User.countDocuments() });
}
