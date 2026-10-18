/**
 * Module A - ParametresPlateformeService
 * Configuration globale de la plateforme (EF-54) — document unique (singleton)
 */

import connectDB from '@/lib/mongoose';
import ParametresPlateforme from '@/domain/models/ParametresPlateforme';
import JournalAudit from '@/domain/models/JournalAudit';
import type { ParametresPlateformeInput } from '@/lib/zod/signalement.schemas';

export class ParametresPlateformeService {
  /** Récupère les paramètres (créés avec les valeurs par défaut si absents) */
  static async get() {
    await connectDB();

    const existant = await ParametresPlateforme.findOne().lean();
    if (existant) return existant;

    const cree = await ParametresPlateforme.create({});
    return cree.toObject();
  }

  /** Met à jour les paramètres (admin) */
  static async update(adminId: string, data: ParametresPlateformeInput) {
    await connectDB();

    // Nettoie les valeurs undefined pour ne pas écraser des champs existants
    const $set: Record<string, unknown> = {};
    for (const [cle, valeur] of Object.entries(data)) {
      if (valeur !== undefined) $set[cle] = valeur;
    }

    const params = await ParametresPlateforme.findOneAndUpdate(
      {},
      { $set },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await JournalAudit.create({
      utilisateurId: adminId,
      action: 'PARAMETRES_MODIFIES',
      entite: 'ParametresPlateforme',
      entiteId: params?._id?.toString() ?? 'singleton',
      details: $set,
    });

    return params;
  }
}

export default ParametresPlateformeService;
