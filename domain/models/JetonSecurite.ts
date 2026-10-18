/**
 * Module A - JetonSecurite Model
 * Jetons à usage unique : vérification d'email et réinitialisation de mot de passe
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

export enum TypeJeton {
  VERIF_EMAIL = 'VERIF_EMAIL',
  RESET_MDP = 'RESET_MDP',
}

export interface IJetonSecurite extends Document {
  _id: mongoose.Types.ObjectId;
  utilisateurId: Types.ObjectId;
  type: TypeJeton;
  /** SHA-256 du jeton envoyé par email (jamais stocké en clair) */
  tokenHash: string;
  expiresAt: Date;
  utiliseLe?: Date | null;
  creeLe: Date;
  modifieLe: Date;
}

const JetonSecuriteSchema = new Schema<IJetonSecurite>(
  {
    utilisateurId: {
      type: Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TypeJeton),
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    utiliseLe: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: 'creeLe',
      updatedAt: 'modifieLe',
    },
  }
);

// Un seul jeton actif par utilisateur et par type
JetonSecuriteSchema.index({ utilisateurId: 1, type: 1 }, { unique: true });
JetonSecuriteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const JetonSecurite =
  models.JetonSecurite ||
  model<IJetonSecurite>('JetonSecurite', JetonSecuriteSchema);

export default JetonSecurite;
