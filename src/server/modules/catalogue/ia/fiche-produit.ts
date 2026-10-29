// MODULE B — IA-B : fiche produit générée à partir des photos (Ali Belkathi)
import "server-only";
import { z } from "zod";
import { VARIETE_SLUGS } from "@/lib/validation/catalogue";

/**
 * Schéma de la fiche suggérée (Vercel AI SDK : streamText + Output.object).
 * Le formulaire vendeur affiche chaque champ avec le badge « Suggéré par l'IA ».
 */
export const ficheProduitSchema = z.object({
  nom: z.string(),
  typeProduit: z.enum(["DATTE", "DERIVE"]),
  variete: z.enum(VARIETE_SLUGS).nullable(),
  categorieQualite: z.enum(["EXTRA", "CAT_I", "CAT_II"]).nullable(),
  presentation: z.enum(["BRANCHEE", "VRAC", "CONDITIONNEE", "DENOYAUTEE"]).nullable(),
  maturite: z.enum(["BSER", "RTOB", "TAMR"]).nullable(),
  description: z.string(),
  confiance: z.number().min(0).max(1),
});

export type FicheProduitSuggeree = z.infer<typeof ficheProduitSchema>;

export const PROMPT_FICHE_PRODUIT = `Tu aides un vendeur de dattes tunisiennes à rédiger sa fiche produit sur DEGLA.
À partir des photos, identifie la variété (Deglet Nour, Alig, Kenta, Khouat Alig, Bessr, Lemsi, Kentichi, Medjool),
la catégorie (Extra, Catégorie I, Catégorie II), la présentation et la maturité (Bser, Rtob, Tamr).
Rédige une description chaleureuse et précise, en français, en vouvoyant l'acheteur. N'invente aucune certification.`;

/** Suggestion simulée utilisée par le template (useFakeStream côté client). */
export const FICHE_DEMO: FicheProduitSuggeree = {
  nom: "Deglet Nour Extra branchée — récolte 2026",
  typeProduit: "DATTE",
  variete: "deglet-nour",
  categorieQualite: "EXTRA",
  presentation: "BRANCHEE",
  maturite: "TAMR",
  description:
    "Des régimes de Deglet Nour cueillis à pleine maturité dans notre palmeraie de Tozeur. Translucides à contre-jour, les dattes offrent une chair moelleuse et un goût de miel délicat. Conservées sur leurs branchettes, elles gardent toute leur fraîcheur : un plaisir à partager.",
  confiance: 0.91,
};
