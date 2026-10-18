/**
 * Module A - IaDocumentService
 * Pré-contrôle IA des documents fournisseur (IA-A / EF-53)
 *
 * Vercel AI SDK : generateText + Output.object + schéma Zod.
 * En l'absence de clé API, un résultat neutre est renvoyé (vérification
 * manuelle par l'administrateur).
 */

import { generateText, Output } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { analyseDocumentSchema, type AnalyseDocument } from '@/lib/zod/ia.schemas';
import { AuditService } from './AuditService';

const TYPES_ATTENDUS =
  'CIN = carte d\u2019identité nationale, RNE = registre national des entreprises, ' +
  'PATENTE = patente commerciale, ATTESTATION_BIO = attestation biologique.';

export class IaDocumentService {
  static iaConfiguree(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  private static resultatIndisponible(type: string): AnalyseDocument {
    return {
      conforme: true,
      typeDetecte: type,
      lisible: true,
      anomalies: ['Pré-contrôle IA non exécuté : aucune clé API configurée.'],
      confiance: 0,
      resume: 'Analyse IA indisponible. Une vérification manuelle est requise.',
    };
  }

  /**
   * Analyse un document fournisseur et renvoie une évaluation structurée.
   * Ne lève jamais : en cas d'erreur, renvoie un résultat neutre.
   */
  static async analyser(params: {
    type: string;
    fichierUrl: string;
    fournisseurId: string;
  }): Promise<AnalyseDocument> {
    if (!IaDocumentService.iaConfiguree()) {
      return IaDocumentService.resultatIndisponible(params.type);
    }

    try {
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY! });

      const { output } = await generateText({
        model: openai(process.env.AI_MODEL || 'gpt-4o-mini'),
        output: Output.object({ schema: analyseDocumentSchema }),
        prompt: [
          "Tu es un assistant de conformité pour une marketplace tunisienne de dattes.",
          `Un fournisseur a déposé un document de type « ${params.type} ».`,
          `Types attendus : ${TYPES_ATTENDUS}`,
          `URL du fichier : ${params.fichierUrl}`,
          "Évalue si le document semble conforme et lisible pour ce type attendu.",
          "Indique les anomalies détectées, ton niveau de confiance (0 à 1) et un court résumé en français.",
        ].join('\n'),
      });

      await AuditService.log({
        action: 'IA_ANALYSE_DOCUMENT',
        entite: 'DocumentFournisseur',
        entiteId: params.fournisseurId,
        details: { type: params.type, conforme: output.conforme, confiance: output.confiance },
      });

      return output;
    } catch (err) {
      console.error('[IaDocumentService] Analyse échouée :', err);
      return {
        conforme: true,
        typeDetecte: params.type,
        lisible: true,
        anomalies: ["Échec de l'analyse IA. Vérification manuelle requise."],
        confiance: 0,
        resume: "Le pré-contrôle IA a échoué. Une vérification manuelle est requise.",
      };
    }
  }
}

export default IaDocumentService;
