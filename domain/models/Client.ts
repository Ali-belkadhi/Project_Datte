/**
 * Module A - Client Model
 * Client profile extending Utilisateur
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

export interface IClient extends Document {
  _id: mongoose.Types.ObjectId;
  utilisateurId: Types.ObjectId;
  adresseParDefautId?: Types.ObjectId;
  creeLe: Date;
  modifieLe: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    utilisateurId: {
      type: Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
      unique: true,
      index: true,
    },
    adresseParDefautId: {
      type: Schema.Types.ObjectId,
      ref: 'Adresse',
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
ClientSchema.index({ utilisateurId: 1 });

export const Client = models.Client || model<IClient>('Client', ClientSchema);

export default Client;
