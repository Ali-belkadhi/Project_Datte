import { Schema, model, models, type Document, type Model } from "mongoose";

export interface IParametresPlateforme {
  _id?: unknown;
  tauxCommission: number;
  fraisLivraisonDefaut: number;
  livraisonGratuiteDes: number | null;
  creditsOffertsInscription: number;
  coutCreditsImage: number;
  coutCreditsMultiImage: number;
  seuilCreditsBas: number;
  delaiMax3DMinutes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ParametresPlateformeDocument = IParametresPlateforme & Document;

const SchemaP = new Schema<ParametresPlateformeDocument>(
  {
    tauxCommission: { type: Number, default: 0.08 },
    fraisLivraisonDefaut: { type: Number, default: 5000 },
    livraisonGratuiteDes: { type: Number, default: null },
    creditsOffertsInscription: { type: Number, default: 5 },
    coutCreditsImage: { type: Number, default: 1 },
    coutCreditsMultiImage: { type: Number, default: 2 },
    seuilCreditsBas: { type: Number, default: 3 },
    delaiMax3DMinutes: { type: Number, default: 15 },
  },
  { timestamps: true },
);

export const ParametresPlateforme: Model<ParametresPlateformeDocument> =
  (models.ParametresPlateforme as Model<ParametresPlateformeDocument>) || model<ParametresPlateformeDocument>("ParametresPlateforme", SchemaP);