/**
 * MODULE B — schémas Zod partagés client + serveur (Ali Belkathi).
 */
import { z } from "zod";
import { GOUVERNORATS } from "@/types/enums";

export const VARIETE_SLUGS = [
  "deglet-nour",
  "medjool",
  "alig",
  "kenta",
  "khouat-alig",
  "bessr",
  "lemsi",
  "kentichi",
] as const;

const base = {
  nom: z.string().trim().min(3, "Le nom du produit est requis (3 caractères minimum)."),
  description: z.string().trim().min(30, "Décrivez le produit (30 caractères minimum)."),
  bio: z.boolean(),
  statut: z.enum(["BROUILLON", "PUBLIE"]),
  regionOrigine: z.enum(GOUVERNORATS),
};

/** Produit : union discriminée datte | dérivé. Prix en millimes, poids en grammes. */
export const produitSchema = z.discriminatedUnion("typeProduit", [
  z.object({
    ...base,
    typeProduit: z.literal("DATTE"),
    variete: z.enum(VARIETE_SLUGS, { error: "Choisissez une variété." }),
    categorieQualite: z.enum(["EXTRA", "CAT_I", "CAT_II"]),
    presentation: z.enum(["BRANCHEE", "VRAC", "CONDITIONNEE", "DENOYAUTEE"]),
    maturite: z.enum(["BSER", "RTOB", "TAMR"]),
    anneeRecolte: z.number().int().min(2020).max(2030),
    prixParKg: z.number().int().min(1000, "Prix minimum : 1,000 DT/kg."),
    stockGrammes: z.number().int().min(0),
    optionsPoids: z.array(z.number().int().positive()).min(1, "Proposez au moins un poids."),
  }),
  z.object({
    ...base,
    typeProduit: z.literal("DERIVE"),
    typeDerive: z.enum(["JUS", "CONFITURE", "PATE", "ROB", "MIEL", "CAFE_NOYAUX", "AUTRE"]),
    variete: z.enum(VARIETE_SLUGS).optional(),
    contenance: z.number().int().positive(),
    uniteContenance: z.enum(["ML", "G"]),
    prixUnitaire: z.number().int().min(500, "Prix minimum : 0,500 DT."),
    stockUnites: z.number().int().min(0),
    ingredients: z.string().trim().min(3),
  }),
]);

export const filtresCatalogueSchema = z.object({
  q: z.string().optional(),
  type: z.enum(["DATTE", "DERIVE"]).optional(),
  varietes: z.array(z.enum(VARIETE_SLUGS)).optional(),
  prixMin: z.number().int().min(0).optional(),
  prixMax: z.number().int().min(0).optional(),
  regions: z.array(z.enum(GOUVERNORATS)).optional(),
  presentations: z.array(z.enum(["BRANCHEE", "VRAC", "CONDITIONNEE", "DENOYAUTEE"])).optional(),
  maturites: z.array(z.enum(["BSER", "RTOB", "TAMR"])).optional(),
  categories: z.array(z.enum(["EXTRA", "CAT_I", "CAT_II"])).optional(),
  bio: z.boolean().optional(),
  avec3D: z.boolean().optional(),
  vendeurVerifie: z.boolean().optional(),
  tri: z.enum(["pertinence", "prix-asc", "prix-desc", "nouveautes", "notes"]).optional(),
});

export const varieteSchema = z.object({
  nom: z.string().trim().min(2),
  nomArabe: z.string().trim().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Minuscules, chiffres et tirets uniquement."),
  origine: z.string().trim().min(2),
  description: z.string().trim().min(20),
  moisDebutRecolte: z.number().int().min(1).max(12),
  moisFinRecolte: z.number().int().min(1).max(12),
  active: z.boolean(),
});

export const generation3DSchema = z.object({
  produitId: z.string().min(1),
  photoIds: z.array(z.string()).min(1, "Ajoutez au moins une photo.").max(4),
});

export const publierModeleSchema = z.object({ modeleId: z.string().min(1) });
export const achatCreditsSchema = z.object({ packId: z.string().min(1) });
export const favoriSchema = z.object({ produitId: z.string().min(1) });
export const reordonnerPhotosSchema = z.object({ produitId: z.string(), ordre: z.array(z.string()).min(1) });
export const produitIdSchema = z.object({ produitId: z.string().min(1) });

export type ProduitInput = z.infer<typeof produitSchema>;
export type VarieteInput = z.infer<typeof varieteSchema>;
