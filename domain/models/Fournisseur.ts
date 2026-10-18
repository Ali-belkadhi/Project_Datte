/**
 * Module A - Fournisseur Model
 * Supplier profile with verification workflow
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';
import { TypeFournisseur, StatutVerification, Gouvernorat } from '../enums';

export interface IFournisseur extends Document {
  _id: mongoose.Types.ObjectId;
  utilisateurId: Types.ObjectId;
  nomBoutique: string;
  slug: string;
  type: TypeFournisseur;
  description?: string;
  logoUrl?: string;
  banniereUrl?: string;
  region: Gouvernorat;
  adresseExploitation: string;
  matriculeFiscal?: string;
  numeroRNE?: string;
  rib: string;
  statutVerification: StatutVerification;
  motifRefus?: string;
  verifieLe?: Date;
  noteMoyenne: number;
  nombreVentes: number;
  tauxCommission?: number;
  soldeCredits3D: number;
  creeLe: Date;
  modifieLe: Date;
}

const FournisseurSchema = new Schema<IFournisseur>(
  {
    utilisateurId: {
      type: Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
      unique: true,
      index: true,
    },
    nomBoutique: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TypeFournisseur),
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logoUrl: {
      type: String,
    },
    banniereUrl: {
      type: String,
    },
    region: {
      type: String,
      enum: Object.values(Gouvernorat),
      required: true,
    },
    adresseExploitation: {
      type: String,
      required: true,
      trim: true,
    },
    matriculeFiscal: {
      type: String,
      trim: true,
    },
    numeroRNE: {
      type: String,
      trim: true,
    },
    rib: {
      type: String,
      required: true,
      trim: true,
      // 20 chiffres, chiffré au repos
    },
    statutVerification: {
      type: String,
      enum: Object.values(StatutVerification),
      default: StatutVerification.EN_ATTENTE,
      index: true,
    },
    motifRefus: {
      type: String,
      trim: true,
    },
    verifieLe: {
      type: Date,
    },
    noteMoyenne: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    nombreVentes: {
      type: Number,
      default: 0,
      min: 0,
    },
    tauxCommission: {
      type: Number,
      min: 0,
      max: 1,
      // null = taux global
    },
    soldeCredits3D: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: {
      createdAt: 'creeLe',
      updatedAt: 'modifieLe',
    },
  }
);

// Indexes
FournisseurSchema.index({ utilisateurId: 1 });
FournisseurSchema.index({ slug: 1 });
FournisseurSchema.index({ statutVerification: 1 });
FournisseurSchema.index({ region: 1 });
FournisseurSchema.index({ type: 1 });

// Virtual for checking if verified
FournisseurSchema.virtual('estVerifie').get(function () {
  return this.statutVerification === StatutVerification.VERIFIE;
});

FournisseurSchema.set('toJSON', { virtuals: true });
FournisseurSchema.set('toObject', { virtuals: true });

export const Fournisseur =
  models.Fournisseur || model<IFournisseur>('Fournisseur', FournisseurSchema);

export default Fournisseur;
