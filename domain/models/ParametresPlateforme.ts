/**
 * Module A - ParametresPlateforme Model
 * Global platform configuration (singleton)
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IParametresPlateforme extends Document {
  _id: mongoose.Types.ObjectId;
  tauxCommission: number;
  fraisLivraisonDefaut: number;
  livraisonGratuiteDes?: number;
  creditsOffertsInscription: number;
  coutCreditsImage: number;
  coutCreditsMultiImage: number;
  seuilCreditsBas: number;
  delaiMax3DMinutes: number;
  creeLe: Date;
  modifieLe: Date;
}

const ParametresPlateformeSchema = new Schema<IParametresPlateforme>(
  {
    tauxCommission: {
      type: Number,
      required: true,
      default: 0.08,
      min: 0,
      max: 1,
    },
    fraisLivraisonDefaut: {
      type: Number,
      required: true,
      default: 7000, // 7 DT en millimes
      min: 0,
    },
    livraisonGratuiteDes: {
      type: Number,
      min: 0,
      // Seuil pour livraison gratuite (optionnel)
    },
    creditsOffertsInscription: {
      type: Number,
      required: true,
      default: 1, // 1 génération d'essai
      min: 0,
    },
    coutCreditsImage: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
    coutCreditsMultiImage: {
      type: Number,
      required: true,
      default: 2,
      min: 1,
    },
    seuilCreditsBas: {
      type: Number,
      required: true,
      default: 3,
      min: 0,
    },
    delaiMax3DMinutes: {
      type: Number,
      required: true,
      default: 15,
      min: 1,
    },
  },
  {
    timestamps: {
      createdAt: 'creeLe',
      updatedAt: 'modifieLe',
    },
  }
);

// Ensure only one instance exists (singleton pattern)
ParametresPlateformeSchema.pre('save', async function () {
  const count = await mongoose.model('ParametresPlateforme').countDocuments();
  if (count > 0 && this.isNew) {
    throw new Error('Only one ParametresPlateforme document can exist');
  }
});

export const ParametresPlateforme =
  models.ParametresPlateforme ||
  model<IParametresPlateforme>('ParametresPlateforme', ParametresPlateformeSchema);

export default ParametresPlateforme;
