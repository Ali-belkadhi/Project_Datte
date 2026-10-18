/**
 * Module A - AuditService
 * Audit log for all important platform actions
 */

import connectDB from '@/lib/mongoose';
import JournalAudit from '@/domain/models/JournalAudit';

export class AuditService {

  static async log(params: {
    utilisateurId?: string;
    action: string;
    entite: string;
    entiteId: string;
    details?: Record<string, any>;
    ip?: string;
  }) {
    await connectDB();
    return JournalAudit.create(params);
  }

  static async getJournal(
    filters: { action?: string; entite?: string; utilisateurId?: string },
    page = 1,
    limit = 50
  ) {
    await connectDB();
    const skip = (page - 1) * limit;
    const query: Record<string, any> = {};

    if (filters.action) query.action = filters.action;
    if (filters.entite) query.entite = filters.entite;
    if (filters.utilisateurId) query.utilisateurId = filters.utilisateurId;

    const [entries, total] = await Promise.all([
      JournalAudit.find(query)
        .sort({ creeLe: -1 })
        .skip(skip)
        .limit(limit)
        .populate('utilisateurId', 'email nom prenom')
        .lean(),
      JournalAudit.countDocuments(query),
    ]);

    return { entries, total, page, totalPages: Math.ceil(total / limit) };
  }
}

export default AuditService;
