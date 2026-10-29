import mongoose, { Schema, Document } from "mongoose";

export interface IFavoriDocument extends Document {
  clientId: string;
  produitId?: string;
  fournisseurId?: string;
  creeLe: Date;
}

const FavoriSchema = new Schema<IFavoriDocument>(
  {
    clientId: { type: String, required: true, index: true },
    produitId: { type: String, index: true },
    fournisseurId: { type: String, index: true },
  },
  { timestamps: { createdAt: "creeLe", updatedAt: false } }
);

FavoriSchema.index({ clientId: 1, produitId: 1 }, { unique: true, sparse: true });
FavoriSchema.index({ clientId: 1, fournisseurId: 1 }, { unique: true, sparse: true });

export const FavoriModel =
  mongoose.models.Favori || mongoose.model<IFavoriDocument>("Favori", FavoriSchema);
