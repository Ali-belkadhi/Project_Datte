import mongoose, { Schema, Document } from "mongoose";

export interface IVarieteDocument extends Document {
  slug: string;
  nom: string;
  nomArabe: string;
  origine: string;
  couleur?: string;
  texture?: string;
  saveur?: string;
  saison?: string;
  calibre?: string;
  resume?: string;
  description?: string;
  usages?: string[];
  active: boolean;
  creeLe: Date;
  misAJourLe: Date;
}

const VarieteSchema = new Schema<IVarieteDocument>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    nom: { type: String, required: true },
    nomArabe: { type: String, default: "" },
    origine: { type: String, required: true },
    couleur: { type: String, default: "" },
    texture: { type: String, default: "" },
    saveur: { type: String, default: "" },
    saison: { type: String, default: "Octobre – Décembre" },
    calibre: { type: String, default: "4 à 5 cm" },
    resume: { type: String, default: "" },
    description: { type: String, default: "" },
    usages: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "creeLe", updatedAt: "misAJourLe" },
  }
);

export const VarieteModel =
  mongoose.models.Variete || mongoose.model<IVarieteDocument>("Variete", VarieteSchema);
