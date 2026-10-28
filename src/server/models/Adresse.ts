import { Schema, model, models, type Document, type Model } from "mongoose";
import type { Gouvernorat } from "@/types/enums";

export interface IAdresse {
  _id?: unknown;
  userId: unknown;
  libelle: string;
  destinataire?: string;
  ligne1: string;
  ligne2?: string;
  ville: string;
  gouvernorat: Gouvernorat;
  codePostal: string;
  telephone: string;
  latitude?: number;
  longitude?: number;
  parDefaut: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AdresseDocument = IAdresse & Document;

const AdresseSchema = new Schema<AdresseDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    libelle: { type: String, required: true, trim: true },
    destinataire: { type: String, trim: true },
    ligne1: { type: String, required: true, trim: true },
    ligne2: { type: String, trim: true },
    ville: { type: String, required: true, trim: true },
    gouvernorat: { type: String, required: true },
    codePostal: { type: String, required: true, match: /^\d{4}$/ },
    telephone: { type: String, required: true, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    parDefaut: { type: Boolean, default: false },
  },
  { timestamps: true },
);

AdresseSchema.index({ userId: 1, parDefaut: 1 });

export const Adresse: Model<AdresseDocument> =
  (models.Adresse as Model<AdresseDocument>) || model<AdresseDocument>("Adresse", AdresseSchema);