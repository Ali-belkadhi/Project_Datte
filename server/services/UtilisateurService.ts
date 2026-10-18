/**
 * Module A - UtilisateurService
 * Core user management service — used by Modules B & C
 */

import connectDB from '@/lib/mongoose';
import Utilisateur, { IUtilisateur } from '@/domain/models/Utilisateur';
import Client from '@/domain/models/Client';
import Fournisseur from '@/domain/models/Fournisseur';
import Administrateur from '@/domain/models/Administrateur';
import JournalAudit from '@/domain/models/JournalAudit';
import { Role, StatutCompte } from '@/domain/enums';
import bcrypt from 'bcryptjs';
import { AuthService } from './AuthService';
import type { InscriptionInput, UpdateProfilInput } from '@/lib/zod/auth.schemas';

export class UtilisateurService {

  // ─── CONTRACT: used by Modules B & C ────────────────────────────────────────

  /** Get current user by ID — called by Module B & C */
  static async getUtilisateurById(id: string): Promise<IUtilisateur | null> {
    await connectDB();
    return Utilisateur.findById(id).lean();
  }

  /** Get current user by email */
  static async getUtilisateurByEmail(email: string): Promise<IUtilisateur | null> {
    await connectDB();
    return Utilisateur.findOne({ email: email.toLowerCase() }).lean();
  }

  /** Check role — CONTRACT for B & C */
  static async requireRole(userId: string, role: Role): Promise<boolean> {
    await connectDB();
    const user = await Utilisateur.findById(userId).select('role statut').lean();
    if (!user) return false;
    if (user.statut !== StatutCompte.ACTIF) return false;
    return user.role === role;
  }

  /** Check if user is active */
  static async isActif(userId: string): Promise<boolean> {
    await connectDB();
    const user = await Utilisateur.findById(userId).select('statut').lean();
    return user?.statut === StatutCompte.ACTIF;
  }

  // ─── INSCRIPTION ─────────────────────────────────────────────────────────────

  static async inscrire(data: InscriptionInput) {
    await connectDB();

    // Check if email already exists
    const existing = await Utilisateur.findOne({ email: data.email });
    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const motDePasseHash = await bcrypt.hash(data.motDePasse, 12);

    // Create user
    const utilisateur = await Utilisateur.create({
      email: data.email,
      motDePasseHash,
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      role: data.role,
      langue: data.langue,
    });

    // Create profile based on role
    if (data.role === Role.CLIENT) {
      await Client.create({ utilisateurId: utilisateur._id });
    }
    // Fournisseur profile is created during onboarding

    // Audit log
    await JournalAudit.create({
      utilisateurId: utilisateur._id,
      action: 'INSCRIPTION',
      entite: 'Utilisateur',
      entiteId: utilisateur._id.toString(),
      details: { role: data.role, email: data.email },
    });

    return utilisateur;
  }

  // ─── UPDATE PROFIL ────────────────────────────────────────────────────────────

  static async updateProfil(userId: string, data: UpdateProfilInput) {
    await connectDB();

    const utilisateur = await Utilisateur.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!utilisateur) throw new Error('USER_NOT_FOUND');

    await JournalAudit.create({
      utilisateurId: userId,
      action: 'PROFIL_MODIFIE',
      entite: 'Utilisateur',
      entiteId: userId,
    });

    return utilisateur;
  }

  // ─── UPDATE LAST CONNECTION ───────────────────────────────────────────────────

  static async updateDerniereConnexion(userId: string) {
    await connectDB();
    await Utilisateur.findByIdAndUpdate(userId, {
      $set: { derniereConnexion: new Date() },
    });
  }

  // ─── EMAIL VERIFICATION ───────────────────────────────────────────────────────

  static async verifierEmail(userId: string) {
    await connectDB();
    await Utilisateur.findByIdAndUpdate(userId, {
      $set: { emailVerifie: true },
    });

    await JournalAudit.create({
      utilisateurId: userId,
      action: 'EMAIL_VERIFIE',
      entite: 'Utilisateur',
      entiteId: userId,
    });
  }

  // ─── PHONE VERIFICATION ───────────────────────────────────────────────────────

  static async verifierTelephone(userId: string) {
    await connectDB();
    await Utilisateur.findByIdAndUpdate(userId, {
      $set: { telephoneVerifie: true },
    });
  }

  /** Définit un nouveau mot de passe (flux « mot de passe oublié ») */
  static async definirMotDePasse(userId: string, nouveauMotDePasse: string) {
    await connectDB();

    const motDePasseHash = await bcrypt.hash(nouveauMotDePasse, 12);
    const utilisateur = await Utilisateur.findByIdAndUpdate(
      userId,
      { $set: { motDePasseHash } },
      { new: true }
    );

    if (!utilisateur) throw new Error('USER_NOT_FOUND');

    // Toutes les sessions existantes sont invalidées
    await AuthService.supprimerToutesLesSessions(userId);

    await JournalAudit.create({
      utilisateurId: userId,
      action: 'MOT_DE_PASSE_REINITIALISE',
      entite: 'Utilisateur',
      entiteId: userId,
    });

    return utilisateur;
  }

  // ─── CHANGE PASSWORD ─────────────────────────────────────────────────────────

  static async changerMotDePasse(
    userId: string,
    ancienMotDePasse: string,
    nouveauMotDePasse: string
  ) {
    await connectDB();

    const utilisateur = await Utilisateur.findById(userId).select('+motDePasseHash');
    if (!utilisateur || !utilisateur.motDePasseHash) {
      throw new Error('USER_NOT_FOUND');
    }

    const isValid = await bcrypt.compare(ancienMotDePasse, utilisateur.motDePasseHash);
    if (!isValid) throw new Error('INVALID_PASSWORD');

    utilisateur.motDePasseHash = await bcrypt.hash(nouveauMotDePasse, 12);
    await utilisateur.save();

    await JournalAudit.create({
      utilisateurId: userId,
      action: 'MOT_DE_PASSE_CHANGE',
      entite: 'Utilisateur',
      entiteId: userId,
    });
  }

  // ─── SUSPEND / DELETE ─────────────────────────────────────────────────────────

  static async suspendre(userId: string, adminId: string) {
    await connectDB();
    await Utilisateur.findByIdAndUpdate(userId, {
      $set: { statut: StatutCompte.SUSPENDU },
    });

    await JournalAudit.create({
      utilisateurId: adminId,
      action: 'UTILISATEUR_SUSPENDU',
      entite: 'Utilisateur',
      entiteId: userId,
    });
  }
}

export default UtilisateurService;
