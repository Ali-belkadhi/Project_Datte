import { Schema, model, models, type Document, type Model } from "mongoose";

export type TypeDocumentFournisseur = "CIN" | "RNE" | "PATENTE" | "ATTESTATION_BIO" | "AUTRE";

export interface IDocumentFournisseur {
  _id?: unknown;
  fournisseurId: unknown;
  type: TypeDocumentFournisseur;
  fichierUrl: string; // private key/path
  nomFichier?: string;
  valide: boolean | null;
  analyseIA?: Record<string, unknown> | null;
  scoreConfianceIA?: number;
  creeLe?: Date;
  updatedAt?: Date;
}

export type DocumentFournisseurDocument = IDocumentFournisseur & Document;

const SchemaDoc = new Schema<DocumentFournisseurDocument>(
  {
    fournisseurId: { type: Schema.Types.ObjectId, required: true, ref: "Fournisseur", index: true },
    type: { type: String, enum: ["CIN", "RNE", "PATENTE", "ATTESTATION_BIO", "AUTRE"], required: true },
    fichierUrl: { type: String, required: true },
    nomFichier: { type: String },
    valide: { type: Boolean, default: null },
    analyseIA: { type: Schema.Types.Mixed, default: null },
    scoreConfianceIA: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "creeLe", updatedAt: true } },
);

export const DocumentFournisseur: Model<DocumentFournisseurDocument> =
  (models.DocumentFournisseur as Model<DocumentFournisseurDocument>) || model<DocumentFournisseurDocument>("DocumentFournisseur", SchemaDoc);