// MODULE A — IA-A : pré-vérification des documents fournisseurs (Baha Ayadi)
import "server-only";
import { z } from "zod";

/**
 * Schéma de sortie attendu du modèle (Vercel AI SDK : generateText + Output.object).
 * L'analyse est INDICATIVE : la décision reste à l'administrateur.
 */
export const analyseDocumentsSchema = z.object({
  scoreConfiance: z.number().min(0).max(100),
  champs: z.array(
    z.object({
      champ: z.string(),
      document: z.enum(["CIN", "RNE", "PATENTE", "ATTESTATION_BIO", "AUTRE"]),
      valeurSaisie: z.string(),
      valeurLue: z.string().nullable(),
      statut: z.enum(["OK", "DIFFERENCE", "ILLISIBLE"]),
    }),
  ),
  alertes: z.array(z.string()),
});

export const PROMPT_ANALYSE_DOCUMENTS = `Tu es un assistant de conformité pour la marketplace DEGLA (Tunisie).
On te fournit les photos de documents d'un vendeur (CIN, extrait RNE, patente, attestation bio)
et les informations qu'il a saisies. Pour chaque champ, compare la valeur saisie et la valeur lue.
Signale les différences, les documents illisibles et les dates d'expiration proches (< 30 jours).
Ne prends jamais de décision : ton analyse est indicative.`;

/**
 * TODO(module A) : appeler le modèle via integrations/ia/model.ts
 *   const { output } = await generateText({ model, prompt, output: Output.object({ schema: analyseDocumentsSchema }), messages: [...images] });
 */
export async function analyserDocumentsIA(_fournisseurId: string): Promise<z.infer<typeof analyseDocumentsSchema> | null> {
  return null; // le template lit l'analyse simulée dans les mocks (repository)
}
