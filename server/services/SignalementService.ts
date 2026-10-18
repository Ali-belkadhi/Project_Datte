/**
 * Module A - SignalementService
 * Signalements & modération (EF-52)
 */

import connectDB from '@/lib/mongoose';
import Signalement from '@/domain/models/Signalement';
import JournalAudit from '@/domain/models/JournalAudit';
import { CibleSignalement, StatutTraitement } from '@/domain/enums';
import type { SignalementInput } from '@/lib/zod/signalement.schemas';

export class SignalementService {
  /** Crée un signalement (utilisateur connecté) */
  static async creer(auteurId: string, data: SignalementInput) {
    await connectDB();

    const signalement = await Signalement.create({
      auteurId,
      cibleType: data.cibleType,
      cibleId: data.cibleId,
      motif: data.motif,
      statut: StatutTraitement.OUVERT,
    });

    await JournalAudit.create({
      utilisateurId: auteurId,
      action: 'SIGNALEMENT_CREE',
      entite: 'Signalement',
      entiteId: signalement._id.toString(),
      details: { cibleType: data.cibleType, cibleId: data.cibleId },
    });

    return signalement;
  }

  /** Liste les signalements (admin), filtrable par statut / cible */
  static async lister(
    filters: { statut?: StatutTraitement; cibleType?: CibleSignalement } = {},
    page = 1,
    limit = 50
  ) {
    await connectDB();
    const query: Record<string, any> = {};
    if (filters.statut) query.statut = filters.statut;
    if (filters.cibleType) query.cibleType = filters.cibleType;

    const skip = (page - 1) * limit;
    const [signalements, total] = await Promise.all([
      Signalement.find(query)
        .sort({ creeLe: -1 })
        .skip(skip)
        .limit(limit)
        .populate('auteurId', 'email nom prenom')
        .lean(),
      Signalement.countDocuments(query),
    ]);

    return { signalements, total, page, totalPages: Math.ceil(total / limit) };
  }

  /** Traite un signalement : TRAITE ou REJETE */
  static async traiter(
    signalementId: string,
    adminId: string,
    statut: StatutTraitement,
    motif?: string
  ) {
    await connectDB();

    const signalement = await Signalement.findByIdAndUpdate(
      signalementId,
      { $set: { statut, traiteParId: adminId } },
      { new: true }
    );

    if (!signalement) throw new Error('SIGNALEMENT_NOT_FOUND');

    await JournalAudit.create({
      utilisateurId: adminId,
      action: 'SIGNALEMENT_TRAITE',
      entite: 'Signalement',
      entiteId: signalementId,
      details: { statut, motif },
    });

    return signalement;
  }

  /** Compte les signalements par statut (dashboard) */
  static async compterParStatut() {
    await connectDB();
    const groupes = await Signalement.aggregate<{ _id: StatutTraitement; total: number }>([
      { $group: { _id: '$statut', total: { $sum: 1 } } },
    ]);
    const parStatut = Object.fromEntries(
      Object.values(StatutTraitement).map((s) => [s, 0])
    ) as Record<StatutTraitement, number>;
    for (const g of groupes) parStatut[g._id] = g.total;
    return parStatut;
  }
}

export default SignalementService;
