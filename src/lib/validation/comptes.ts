/**
 * MODULE A — schémas Zod partagés client + serveur (Baha Ayadi).
 */
import { z } from "zod";
import { GOUVERNORATS } from "@/types/enums";

const telephoneTN = z
  .string()
  .trim()
  .regex(/^(\+216\s?)?[2-9]\d(\s?\d{3}){2}$/, "Numéro tunisien attendu (ex. +216 22 345 678).");

export const connexionSchema = z.object({
  email: z.email("Adresse e-mail invalide."),
  motDePasse: z.string().min(8, "8 caractères minimum."),
});

export const inscriptionSchema = z
  .object({
    role: z.enum(["CLIENT", "FOURNISSEUR"]),
    prenom: z.string().trim().min(2, "Votre prénom, s'il vous plaît."),
    nom: z.string().trim().min(2, "Votre nom, s'il vous plaît."),
    email: z.email("Adresse e-mail invalide."),
    telephone: telephoneTN,
    motDePasse: z.string().min(8, "8 caractères minimum."),
    conditions: z.literal(true, { error: "Veuillez accepter les conditions." }),
  });

export const otpSchema = z.object({ email: z.email("Adresse e-mail invalide."), code: z.string().regex(/^\d{6}$/, "Code à 6 chiffres.") });

export const motDePasseOublieSchema = z.object({ email: z.email("Adresse e-mail invalide.") });

export const profilSchema = z.object({
  prenom: z.string().trim().min(2),
  nom: z.string().trim().min(2),
  email: z.email(),
  telephone: telephoneTN,
  langue: z.enum(["FR", "AR", "EN"]),
});

export const adresseSchema = z.object({
  libelle: z.string().trim().min(2, "Donnez un nom à cette adresse."),
  destinataire: z.string().trim().min(2, "Nom du destinataire requis."),
  ligne1: z.string().trim().min(4, "Adresse requise."),
  ligne2: z.string().trim().optional(),
  ville: z.string().trim().min(2, "Ville requise."),
  gouvernorat: z.enum(GOUVERNORATS, { error: "Choisissez un gouvernorat." }),
  codePostal: z.string().regex(/^\d{4}$/, "Code postal à 4 chiffres."),
  telephone: telephoneTN,
  parDefaut: z.boolean(),
});

export const documentOnboardingSchema = z.object({
  type: z.enum(["CIN", "RNE", "PATENTE", "ATTESTATION_BIO"]),
  fichierUrl: z.string().min(1),
  nomFichier: z.string().min(1),
});

export const onboardingSchema = z.object({
  nomBoutique: z.string().trim().min(3, "Le nom de la boutique est requis."),
  type: z.enum(["PRODUCTEUR", "COOPERATIVE", "REVENDEUR", "TRANSFORMATEUR"]),
  region: z.enum(GOUVERNORATS),
  adresseExploitation: z.string().trim().min(3, "L'adresse d'exploitation est requise."),
  description: z.string().trim().min(20, "Décrivez votre boutique en quelques phrases (20 caractères minimum)."),
  rib: z.string().regex(/^\d{20}$/, "Le RIB tunisien comporte 20 chiffres."),
  documents: z
    .array(documentOnboardingSchema)
    .min(3, "CIN, RNE et patente sont requis.")
    .refine((docs) => ["CIN", "RNE", "PATENTE"].every((t) => docs.some((d) => d.type === t)), "CIN, RNE et patente sont requis."),
});

export const boutiqueSchema = z.object({
  nomBoutique: z.string().trim().min(3),
  description: z.string().trim().min(20),
  couleur: z.enum(["amber", "date", "palm", "clay", "night"]),
  region: z.enum(GOUVERNORATS),
  delaiExpedition: z.string().trim().min(3),
  logoUrl: z.string().trim().optional(),
  bannerUrl: z.string().trim().optional(),
});

export const changementMotDePasseSchema = z
  .object({
    motDePasseActuel: z.string().min(8, "8 caractères minimum."),
    nouveauMotDePasse: z.string().min(8, "8 caractères minimum.").max(72),
    confirmation: z.string().min(8, "Confirmez le mot de passe."),
  })
  .refine((d) => d.nouveauMotDePasse === d.confirmation, { message: "Les mots de passe ne correspondent pas.", path: ["confirmation"] });

export const messageSchema = z.object({
  conversationId: z.string().min(1),
  contenu: z.string().trim().min(1, "Message vide.").max(2000),
});

export const decisionFournisseurSchema = z.object({
  fournisseurId: z.string().min(1),
  motif: z.string().trim().max(500).optional(),
});

export const refusFournisseurSchema = decisionFournisseurSchema.extend({
  motif: z.string().trim().min(10, "Indiquez un motif (10 caractères minimum)."),
});

export const parametresSchema = z.object({
  tauxCommission: z.number().min(0).max(30),
  fraisLivraisonDefaut: z.number().int().min(0),
  livraisonGratuiteDes: z.number().int().min(0),
  creditsOffertsInscription: z.number().int().min(0),
  coutCreditsImage: z.number().int().min(1),
  coutCreditsMultiImage: z.number().int().min(1),
});

export const notificationsPrefsSchema = z.record(z.string(), z.boolean());

export type ConnexionInput = z.infer<typeof connexionSchema>;
export type InscriptionInput = z.infer<typeof inscriptionSchema>;
export type ProfilInput = z.infer<typeof profilSchema>;
export type AdresseInput = z.infer<typeof adresseSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type BoutiqueInput = z.infer<typeof boutiqueSchema>;
