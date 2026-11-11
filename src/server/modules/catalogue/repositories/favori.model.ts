import mongoose, { Schema, type Document } from "mongoose";

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

FavoriSchema.index({ clientId: 1, produitId: 1 }, {
  name: "favori_client_produit_unique",
  unique: true,
  partialFilterExpression: { produitId: { $type: "string" } },
});
FavoriSchema.index({ clientId: 1, fournisseurId: 1 }, {
  name: "favori_client_fournisseur_unique",
  unique: true,
  partialFilterExpression: { fournisseurId: { $type: "string" } },
});

export const FavoriModel =
  mongoose.models.Favori || mongoose.model<IFavoriDocument>("Favori", FavoriSchema);
