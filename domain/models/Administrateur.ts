/**
 * Module A - Administrateur Model
 * Admin profile with permission levels
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';
import { NiveauAdmin } from '../enums';

export interface IAdministrateur extends Document {
  _id: mongoose.Types.ObjectId;
  utilisateurId: Types.ObjectId;
  niveau: NiveauAdmin;
  creeLe: Date;
  modifieLe: Date;
}

const AdministrateurSchema = new Schema<IAdministrateur>(
  {
    utilisateurId: {
      type: Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
      unique: true,
      index: true,
    },
    niveau: {
      type: String,
      enum: Object.values(NiveauAdmin),
      required: true,
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
AdministrateurSchema.index({ utilisateurId: 1 });
AdministrateurSchema.index({ niveau: 1 });

export const Administrateur =
  models.Administrateur || model<IAdministrateur>('Administrateur', AdministrateurSchema);

export default Administrateur;
