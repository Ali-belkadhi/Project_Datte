/**
 * Module A - AbonnementPush Model
 * Web Push subscription management
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

export interface IAbonnementPush extends Document {
  _id: mongoose.Types.ObjectId;
  utilisateurId: Types.ObjectId;
  endpoint: string;
  p256dh: string;
  auth: string;
  creeLe: Date;
  modifieLe: Date;
}

const AbonnementPushSchema = new Schema<IAbonnementPush>(
  {
    utilisateurId: {
      type: Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
    },
    p256dh: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
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
AbonnementPushSchema.index({ utilisateurId: 1 });
AbonnementPushSchema.index({ endpoint: 1 });

export const AbonnementPush =
  models.AbonnementPush || model<IAbonnementPush>('AbonnementPush', AbonnementPushSchema);

export default AbonnementPush;
