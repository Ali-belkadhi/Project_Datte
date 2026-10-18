/**
 * Module A - Signalement Model
 * User reports for moderation
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';
import { CibleSignalement, StatutTraitement } from '../enums';

export interface ISignalement extends Document {
  _id: mongoose.Types.ObjectId;
  auteurId: Types.ObjectId;
  cibleType: CibleSignalement;
  cibleId: string;
  motif: string;
  statut: StatutTraitement;
  traiteParId?: Types.ObjectId;
  creeLe: Date;
  modifieLe: Date;
}

const SignalementSchema = new Schema<ISignalement>(
  {
    auteurId: {
      type: Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
      index: true,
    },
    cibleType: {
      type: String,
      enum: Object.values(CibleSignalement),
      required: true,
    },
    cibleId: {
      type: String,
      required: true,
      // Generic string to reference any entity
    },
    motif: {
      type: String,
      required: true,
      trim: true,
    },
    statut: {
      type: String,
      enum: Object.values(StatutTraitement),
      default: StatutTraitement.OUVERT,
      index: true,
    },
    traiteParId: {
      type: Schema.Types.ObjectId,
      ref: 'Administrateur',
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
SignalementSchema.index({ auteurId: 1 });
SignalementSchema.index({ cibleType: 1, cibleId: 1 });
SignalementSchema.index({ statut: 1 });

export const Signalement =
  models.Signalement || model<ISignalement>('Signalement', SignalementSchema);

export default Signalement;
