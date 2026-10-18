/**
 * Module A - FournisseurService
 * Supplier onboarding, verification, and management
 * CONTRACT: estFournisseurVerifie() used by Modules B & C
 */

import connectDB from '@/lib/mongoose';
import Fournisseur, { IFournisseur } from '@/domain/models/Fournisseur';
import Utilisateur from '@/domain/models/Utilisateur';
import DocumentFournisseur from '@/domain/models/DocumentFournisseur';
import JournalAudit from '@/domain/models/JournalAudit';
import { StatutVerification, Role } from '@/domain/enums';
import type {
  OnboardingFournisseurInput,
  UpdateBoutiqueInput,
  ValiderFournisseurInput,
} from '@/lib/zod/fournisseur.schemas';

export class FournisseurService {

  // ─── CONTRACT: used by Modules B & C ────────────────────────────────────────

  /** Get fournisseur by ID — CONTRACT for B & C */
  static async getFournisseur(id: string): Promise<IFournisseur | null> {
    await connectDB();
    return Fournisseur.findById(id).lean();
  }

  /** Get fournisseur by utilisateur ID */
  static async getFournisseurByUtilisateur(utilisateurId: string): Promise<IFournisseur | null> {
    await connectDB();
    return Fournisseur.findOne({ utilisateurId }).lean();
  }

  /** Get fournisseur by public slug (boutique publique) */
  static async getFournisseurBySlug(slug: string): Promise<IFournisseur | null> {
    await connectDB();
    return Fournisseur.findOne({ slug: slug.toLowerCase() }).lean();
  }

  /** Check if verified — CONTRACT for B & C */
  static async estFournisseurVerifie(fournisseurId: string): Promise<boolean> {
    await connectDB();
    const f = await Fournisseur.findById(fournisseurId)
      .select('statutVerification')
      .lean();
    return f?.statutVerification === StatutVerification.VERIFIE;
  }

  // ─── ONBOARDING ──────────────────────────────────────────────────────────────

  static async creerProfil(utilisateurId: string, data: OnboardingFournisseurInput) {
    await connectDB();

    // Check user exists and has FOURNISSEUR role
    const utilisateur = await Utilisateur.findById(utilisateurId);
    if (!utilisateur || utilisateur.role !== Role.FOURNISSEUR) {
      throw new Error('ROLE_INVALIDE');
    }

    // Check if profile already exists
    const existing = await Fournisseur.findOne({ utilisateurId });
    if (existing) throw new Error('PROFIL_EXISTE_DEJA');

    // Generate unique slug from shop name
    const baseSlug = data.nomBoutique
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;
    while (await Fournisseur.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const fournisseur = await Fournisseur.create({
      utilisateurId,
      ...data,
      slug,
      statutVerification: StatutVerification.EN_ATTENTE,
    });

    await JournalAudit.create({
      utilisateurId,
      action: 'FOURNISSEUR_INSCRIPTION',
      entite: 'Fournisseur',
      entiteId: fournisseur._id.toString(),
    });

    return fournisseur;
  }

  // ─── UPDATE BOUTIQUE ─────────────────────────────────────────────────────────

  static async updateBoutique(fournisseurId: string, data: UpdateBoutiqueInput) {
    await connectDB();
    const fournisseur = await Fournisseur.findByIdAndUpdate(
      fournisseurId,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!fournisseur) throw new Error('FOURNISSEUR_NOT_FOUND');
    return fournisseur;
  }

  // ─── ADMIN: VALIDATE / REFUSE ─────────────────────────────────────────────────

  static async valider(data: ValiderFournisseurInput, adminId: string) {
    await connectDB();
    const { fournisseurId, valide, motifRefus } = data;

    const update = valide
      ? {
          statutVerification: StatutVerification.VERIFIE,
          verifieLe: new Date(),
          motifRefus: null,
        }
      : {
          statutVerification: StatutVerification.REFUSE,
          motifRefus,
        };

    const fournisseur = await Fournisseur.findByIdAndUpdate(
      fournisseurId,
      { $set: update },
      { new: true }
    );

    if (!fournisseur) throw new Error('FOURNISSEUR_NOT_FOUND');

    await JournalAudit.create({
      utilisateurId: adminId,
      action: valide ? 'FOURNISSEUR_VALIDE' : 'FOURNISSEUR_REFUSE',
      entite: 'Fournisseur',
      entiteId: fournisseurId,
      details: { motifRefus },
    });

    return fournisseur;
  }

  // ─── ADMIN: SUSPENDRE (EF-11 / EF-50) ─────────────────────────────────────────

  static async suspendre(fournisseurId: string, adminId: string, motif?: string) {
    await connectDB();

    const fournisseur = await Fournisseur.findByIdAndUpdate(
      fournisseurId,
      {
        $set: {
          statutVerification: StatutVerification.SUSPENDU,
          motifRefus: motif ?? null,
        },
      },
      { new: true }
    );

    if (!fournisseur) throw new Error('FOURNISSEUR_NOT_FOUND');

    await JournalAudit.create({
      utilisateurId: adminId,
      action: 'FOURNISSEUR_SUSPENDU',
      entite: 'Fournisseur',
      entiteId: fournisseurId,
      details: { motif },
    });

    return fournisseur;
  }

  // ─── STATS (admin dashboard) ──────────────────────────────────────────────────

  static async compterParStatut() {
    await connectDB();
    const groupes = await Fournisseur.aggregate<{ _id: StatutVerification; total: number }>([
      { $group: { _id: '$statutVerification', total: { $sum: 1 } } },
    ]);
    const parStatut = Object.fromEntries(
      Object.values(StatutVerification).map((s) => [s, 0])
    ) as Record<StatutVerification, number>;
    for (const g of groupes) parStatut[g._id] = g.total;
    return parStatut;
  }

  // ─── LIST (admin) ─────────────────────────────────────────────────────────────

  static async lister(
    statut?: StatutVerification,
    page = 1,
    limit = 20
  ) {
    await connectDB();
    const query = statut ? { statutVerification: statut } : {};
    const skip = (page - 1) * limit;

    const [fournisseurs, total] = await Promise.all([
      Fournisseur.find(query).skip(skip).limit(limit).sort({ creeLe: -1 }).lean(),
      Fournisseur.countDocuments(query),
    ]);

    return { fournisseurs, total, page, totalPages: Math.ceil(total / limit) };
  }

  // ─── CREDITS 3D ──────────────────────────────────────────────────────────────

  static async getSoldeCredits(fournisseurId: string): Promise<number> {
    await connectDB();
    const f = await Fournisseur.findById(fournisseurId).select('soldeCredits3D').lean();
    return f?.soldeCredits3D ?? 0;
  }

  static async incrementerCredits(fournisseurId: string, credits: number) {
    await connectDB();
    return Fournisseur.findByIdAndUpdate(
      fournisseurId,
      { $inc: { soldeCredits3D: credits } },
      { new: true }
    );
  }

  static async decrementerCredits(fournisseurId: string, credits: number) {
    await connectDB();
    const f = await Fournisseur.findById(fournisseurId).select('soldeCredits3D');
    if (!f) throw new Error('FOURNISSEUR_NOT_FOUND');
    if (f.soldeCredits3D < credits) throw new Error('CREDITS_INSUFFISANTS');

    return Fournisseur.findByIdAndUpdate(
      fournisseurId,
      { $inc: { soldeCredits3D: -credits } },
      { new: true }
    );
  }
}

export default FournisseurService;
