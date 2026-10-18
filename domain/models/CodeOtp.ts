/**
 * Module A - CodeOtp Model
 * Codes OTP envoyés par SMS (EF-02) : expiration + limite de tentatives
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

export enum FinaliteOtp {
  VERIF_TELEPHONE = 'VERIF_TELEPHONE',
}

export interface ICodeOtp extends Document {
  _id: mongoose.Types.ObjectId;
  utilisateurId: Types.ObjectId;
  telephone: string;
  /** SHA-256 du code à 6 chiffres */
  codeHash: string;
  expiresAt: Date;
  tentatives: number;
  maxTentatives: number;
  consommeLe?: Date | null;
  creeLe: Date;
  modifieLe: Date;
}

const CodeOtpSchema = new Schema<ICodeOtp>(
  {
    utilisateurId: {
      type: Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
      index: true,
    },
    telephone: {
      type: String,
      required: true,
      trim: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    tentatives: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxTentatives: {
      type: Number,
      default: 5,
      min: 1,
    },
    consommeLe: {
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

CodeOtpSchema.index({ utilisateurId: 1 });
// Nettoyage automatique des codes expirés
CodeOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const CodeOtp = models.CodeOtp || model<ICodeOtp>('CodeOtp', CodeOtpSchema);

export default CodeOtp;
