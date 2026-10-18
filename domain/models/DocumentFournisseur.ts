/**
 * Module A - DocumentFournisseur Model
 * Supplier verification documents
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';
import { TypeDocument } from '../enums';

export interface IDocumentFournisseur extends Document {
  _id: mongoose.Types.ObjectId;
  fournisseurId: Types.ObjectId;
  type: TypeDocument;
  fichierUrl: string;
  valide?: boolean | null;
  /** Résultat du pré-contrôle IA (EF-53 / IA-A) */
  analyseIa?: string;
  analyseIaLe?: Date;
  creeLe: Date;
  modifieLe: Date;
}

const DocumentFournisseurSchema = new Schema<IDocumentFournisseur>(
  {
    fournisseurId: {
      type: Schema.Types.ObjectId,
      ref: 'Fournisseur',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TypeDocument),
      required: true,
    },
    fichierUrl: {
      type: String,
      required: true,
      // Stockage privé sécurisé
    },
    valide: {
      type: Boolean,
      // null = non examiné, true = valide, false = invalide
      default: null,
    },
    analyseIa: {
      type: String,
      // Résultat du pré-contrôle IA (EF-53 / IA-A)
    },
    analyseIaLe: {
      type: Date,
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
DocumentFournisseurSchema.index({ fournisseurId: 1 });
DocumentFournisseurSchema.index({ type: 1 });
DocumentFournisseurSchema.index({ valide: 1 });

// Compound index for unique document type per supplier
DocumentFournisseurSchema.index({ fournisseurId: 1, type: 1 });

export const DocumentFournisseur =
  models.DocumentFournisseur ||
  model<IDocumentFournisseur>('DocumentFournisseur', DocumentFournisseurSchema);

export default DocumentFournisseur;
