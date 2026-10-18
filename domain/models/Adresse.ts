/**
 * Module A - Adresse Model
 * Delivery addresses for clients
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';
import { Gouvernorat } from '../enums';

export interface IAdresse extends Document {
  _id: mongoose.Types.ObjectId;
  clientId: Types.ObjectId;
  libelle: string;
  ligne1: string;
  ligne2?: string;
  ville: string;
  gouvernorat: Gouvernorat;
  codePostal: string;
  telephone: string;
  latitude?: number;
  longitude?: number;
  creeLe: Date;
  modifieLe: Date;
}

const AdresseSchema = new Schema<IAdresse>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    libelle: {
      type: String,
      required: true,
      trim: true,
      // Ex: "Maison", "Bureau"
    },
    ligne1: {
      type: String,
      required: true,
      trim: true,
    },
    ligne2: {
      type: String,
      trim: true,
    },
    ville: {
      type: String,
      required: true,
      trim: true,
    },
    gouvernorat: {
      type: String,
      enum: Object.values(Gouvernorat),
      required: true,
    },
    codePostal: {
      type: String,
      required: true,
      trim: true,
      // 4 chiffres
    },
    telephone: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
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
AdresseSchema.index({ clientId: 1 });
AdresseSchema.index({ gouvernorat: 1 });

// Virtual for full address
AdresseSchema.virtual('adresseComplete').get(function () {
  return `${this.ligne1}${this.ligne2 ? ', ' + this.ligne2 : ''}, ${this.ville}, ${this.codePostal}`;
});

AdresseSchema.set('toJSON', { virtuals: true });
AdresseSchema.set('toObject', { virtuals: true });

export const Adresse = models.Adresse || model<IAdresse>('Adresse', AdresseSchema);

export default Adresse;
