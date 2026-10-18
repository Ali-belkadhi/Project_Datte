/**
 * Module A - Schémas Zod pour le pré-contrôle IA des documents (IA-A / EF-53)
 */

import { z } from 'zod';

export const analyseDocumentSchema = z.object({
  conforme: z.boolean(),
  typeDetecte: z.string(),
  lisible: z.boolean(),
  anomalies: z.array(z.string()),
  confiance: z.number().min(0).max(1),
  resume: z.string(),
});

export type AnalyseDocument = z.infer<typeof analyseDocumentSchema>;
