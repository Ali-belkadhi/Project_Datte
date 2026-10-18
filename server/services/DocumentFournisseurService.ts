/**
 * Module A - DocumentFournisseurService
 * Dépôt et consultation des pièces justificatives fournisseur (EF-10)
 */

import connectDB from '@/lib/mongoose';
import DocumentFournisseur from '@/domain/models/DocumentFournisseur';
import JournalAudit from '@/domain/models/JournalAudit';
import { IaDocumentService } from './IaDocumentService';
import type { DocumentFournisseurInput } from '@/lib/zod/fournisseur.schemas';

export class DocumentFournisseurService {
  /** Ajoute (ou remplace) un document pour un fournisseur, avec pré-contrôle IA */
  static async ajouter(
    fournisseurId: string,
    utilisateurId: string,
    data: DocumentFournisseurInput
  ) {
    await connectDB();

    const doc = await DocumentFournisseur.findOneAndUpdate(
      { fournisseurId, type: data.type },
      { $set: { fichierUrl: data.fichierUrl, valide: null } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await JournalAudit.create({
      utilisateurId,
      action: 'DOCUMENT_AJOUTE',
      entite: 'DocumentFournisseur',
      entiteId: doc._id.toString(),
      details: { fournisseurId, type: data.type },
    });

    // Pré-contrôle IA (EF-53) — ne lève jamais, renvoie un résultat neutre si indisponible
    const analyse = await IaDocumentService.analyser({
      type: data.type,
      fichierUrl: data.fichierUrl,
      fournisseurId,
    });
    const docAnalyse = await DocumentFournisseur.findByIdAndUpdate(
      doc._id,
      {
        $set: {
          analyseIa: JSON.stringify(analyse),
          analyseIaLe: new Date(),
        },
      },
      { new: true }
    );

    return docAnalyse ?? doc;
  }

  /** Liste les documents d'un fournisseur */
  static async lister(fournisseurId: string) {
    await connectDB();
    return DocumentFournisseur.find({ fournisseurId }).sort({ type: 1 }).lean();
  }

  /** Met à jour l'avis IA / admin sur un document */
  static async definirValidation(documentId: string, valide: boolean | null) {
    await connectDB();
    return DocumentFournisseur.findByIdAndUpdate(
      documentId,
      { $set: { valide } },
      { new: true }
    );
  }
}

export default DocumentFournisseurService;
