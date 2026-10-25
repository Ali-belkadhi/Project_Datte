/**
 * MODULE C — schémas Zod partagés client + serveur (Karim Ouertatani).
 */
import { z } from "zod";

export const lignePanierSchema = z
  .object({
    produitId: z.string().min(1),
    quantiteGrammes: z.number().int().min(500).max(50000).optional(),
    quantiteUnites: z.number().int().min(1).max(99).optional(),
  })
  .refine((l) => (l.quantiteGrammes === undefined) !== (l.quantiteUnites === undefined), {
    message: "Indiquez un poids (datte) OU une quantité (dérivé).",
  });

export const majLignePanierSchema = z.object({
  ligneId: z.string().min(1),
  quantiteGrammes: z.number().int().min(0).optional(),
  quantiteUnites: z.number().int().min(0).optional(),
});

export const retraitLignePanierSchema = z.object({ produitId: z.string().min(1) });

const codeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{4,16}$/, "Code invalide.");

const lignesSchema = z
  .array(z.object({ produitId: z.string().min(1), quantiteGrammes: z.number().int().positive().optional(), quantiteUnites: z.number().int().positive().optional() }))
  .min(1, "Votre panier est vide.");

export const codePromoSchema = z.object({ code: codeSchema, lignes: lignesSchema.optional() });

export const checkoutSchema = z.object({
  lignes: lignesSchema,
  adresseId: z.string().min(1, "Choisissez une adresse."),
  livraison: z.record(z.string(), z.enum(["standard", "express"])),
  methodePaiement: z.enum(["KONNECT", "FLOUCI", "CARTE", "A_LA_LIVRAISON"]),
  codePromo: codeSchema.optional(),
});

export const reprisePaiementSchema = z.object({ numero: z.string().min(1) });

export const annulationSchema = z.object({ numero: z.string().min(1), motif: z.string().trim().optional() });

export const sousCommandeSchema = z.object({ numero: z.string().min(1) });

export const refusSousCommandeSchema = sousCommandeSchema.extend({
  motif: z.string().trim().min(5, "Indiquez un motif de refus."),
});

export const expeditionSchema = sousCommandeSchema.extend({
  transporteur: z.string().min(2, "Choisissez un transporteur."),
  numeroSuivi: z.string().trim().min(6, "Numéro de suivi requis."),
});

export const avisSchema = z.object({
  ligneCommandeId: z.string().min(1),
  note: z.number().int().min(1, "Choisissez une note.").max(5),
  commentaire: z.string().trim().min(10, "Quelques mots sur le produit (10 caractères minimum).").max(1000),
  photos: z.array(z.string()).max(3).optional(),
});

export const reponseAvisSchema = z.object({
  avisId: z.string().min(1),
  reponse: z.string().trim().min(5, "Votre réponse est trop courte.").max(800),
});

export const litigeSchema = z.object({
  sousCommandeNumero: z.string().min(1),
  motif: z.enum(["NON_RECU", "ABIME", "NON_CONFORME", "AUTRE"]),
  description: z.string().trim().min(15, "Décrivez le problème (15 caractères minimum)."),
});

export const resolutionLitigeSchema = z.object({
  litigeId: z.string().min(1),
  decision: z.enum(["RESOLU_CLIENT", "RESOLU_FOURNISSEUR", "CLOS"]),
  montantRembourse: z.number().int().min(0).optional(),
  commentaire: z.string().trim().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AvisInput = z.infer<typeof avisSchema>;
export type ExpeditionInput = z.infer<typeof expeditionSchema>;

/* ------------------------------ Admin : codes promo ------------------------------ */

export const codePromoAdminSchema = z
  .object({
    code: codeSchema,
    type: z.enum(["POURCENTAGE", "MONTANT_FIXE"]),
    valeur: z.number().int().positive("Valeur requise."),
    fournisseurId: z.string().optional(),
    montantMinimum: z.number().int().min(0),
    debut: z.coerce.date(),
    fin: z.coerce.date(),
    utilisationsMax: z.number().int().positive().optional(),
  })
  .refine((c) => c.fin > c.debut, { message: "La date de fin doit suivre la date de début.", path: ["fin"] });

export const basculeCodePromoSchema = z.object({ code: codeSchema, actif: z.boolean() });
