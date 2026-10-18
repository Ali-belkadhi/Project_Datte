/**
 * Module A - Utilisateur Model
 * Base user model for authentication and profiles
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';
import { Role, Langue, StatutCompte } from '../enums';

export interface IUtilisateur extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  motDePasseHash?: string;
  nom: string;
  prenom: string;
  telephone?: string;
  avatarUrl?: string;
  role: Role;
  langue: Langue;
  emailVerifie: boolean;
  telephoneVerifie: boolean;
  statut: StatutCompte;
  derniereConnexion?: Date;
  // ─── Champs requis par l'adaptateur Auth.js (collection partagée `users`) ───
  /** Nom complet affiché par Auth.js */
  name?: string;
  /** Date de vérification d'email au sens Auth.js (null = non vérifié) */
  emailVerified?: Date | null;
  /** Photo de profil OAuth */
  image?: string;
  creeLe: Date;
  modifieLe: Date;
}

const UtilisateurSchema = new Schema<IUtilisateur>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    motDePasseHash: {
      type: String,
      // Optional pour les comptes Google OAuth
    },
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    prenom: {
      type: String,
      required: true,
      trim: true,
    },
    telephone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      required: true,
      default: Role.CLIENT,
    },
    langue: {
      type: String,
      enum: Object.values(Langue),
      default: Langue.FR,
    },
    emailVerifie: {
      type: Boolean,
      default: false,
    },
    telephoneVerifie: {
      type: Boolean,
      default: false,
    },
    statut: {
      type: String,
      enum: Object.values(StatutCompte),
      default: StatutCompte.ACTIF,
    },
    derniereConnexion: {
      type: Date,
    },
    // Champs Auth.js (adaptateur MongoDB) — collection partagée `users`
    name: {
      type: String,
      trim: true,
    },
    emailVerified: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: 'creeLe',
      updatedAt: 'modifieLe',
    },
    // L'adaptateur Auth.js MongoDB utilise par défaut la collection `users`.
    // On y range directement notre modèle métier pour n'avoir qu'une seule
    // source de vérité (identité + profil).
    collection: 'users',
  }
);

// Indexes
UtilisateurSchema.index({ email: 1 });
UtilisateurSchema.index({ role: 1 });
UtilisateurSchema.index({ statut: 1 });

// Virtual for full name
UtilisateurSchema.virtual('nomComplet').get(function () {
  return `${this.prenom} ${this.nom}`;
});

// Ensure virtuals are included in JSON
UtilisateurSchema.set('toJSON', { virtuals: true });
UtilisateurSchema.set('toObject', { virtuals: true });

export const Utilisateur =
  models.Utilisateur || model<IUtilisateur>('Utilisateur', UtilisateurSchema);

export default Utilisateur;
