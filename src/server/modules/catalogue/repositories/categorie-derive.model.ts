import mongoose, { Schema, Document } from "mongoose";

export interface ICategorieDeriveDocument extends Document {
  code: string;
  nom: string;
  description: string;
  image?: string;
  active: boolean;
  creeLe: Date;
  misAJourLe: Date;
}

const CategorieDeriveSchema = new Schema<ICategorieDeriveDocument>(
  {
    code: { type: String, required: true, unique: true, index: true },
    nom: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "creeLe", updatedAt: "misAJourLe" },
  }
);

export const CategorieDeriveModel =
  mongoose.models.CategorieDerive ||
  mongoose.model<ICategorieDeriveDocument>("CategorieDerive", CategorieDeriveSchema);
