import mongoose, { Schema, Document } from "mongoose";

/* ---------------------------------- Pack ---------------------------------- */

export interface IPackCreditsDocument extends Document {
  packId: string;
  nom: string;
  nombreCredits: number;
  prix: number; // millimes (ex: 25000 = 25 DT)
  description: string;
  misEnAvant: boolean;
  actif: boolean;
  creeLe: Date;
  misAJourLe: Date;
}

const PackCreditsSchema = new Schema<IPackCreditsDocument>(
  {
    packId: { type: String, required: true, unique: true, index: true },
    nom: { type: String, required: true },
    nombreCredits: { type: Number, required: true, min: 1 },
    prix: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    misEnAvant: { type: Boolean, default: false },
    actif: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "creeLe", updatedAt: "misAJourLe" } }
);

export const PackCreditsModel =
  mongoose.models.PackCredits || mongoose.model<IPackCreditsDocument>("PackCredits", PackCreditsSchema);

/* --------------------------------- Solde ---------------------------------- */

export interface ICreditSoldeDocument extends Document {
  fournisseurId: string;
  solde: number;
  seuilBas: number;
  coutImage: number;
  coutMultiImage: number;
  misAJourLe: Date;
}

const CreditSoldeSchema = new Schema<ICreditSoldeDocument>(
  {
    fournisseurId: { type: String, required: true, unique: true, index: true },
    solde: { type: Number, required: true, default: 12 },
    seuilBas: { type: Number, default: 3 },
    coutImage: { type: Number, default: 1 },
    coutMultiImage: { type: Number, default: 2 },
  },
  { timestamps: { createdAt: false, updatedAt: "misAJourLe" } }
);

export const CreditSoldeModel =
  mongoose.models.CreditSolde || mongoose.model<ICreditSoldeDocument>("CreditSolde", CreditSoldeSchema);

/* ------------------------------- Mouvement -------------------------------- */

export interface ICreditMouvementDocument extends Document {
  fournisseurId: string;
  type: "RESERVATION" | "RESTITUTION" | "CONSOMMATION" | "ACHAT" | "BONUS";
  quantite: number;
  soldeApres: number;
  motif: string;
  creeLe: Date;
}

const CreditMouvementSchema = new Schema<ICreditMouvementDocument>(
  {
    fournisseurId: { type: String, required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["RESERVATION", "RESTITUTION", "CONSOMMATION", "ACHAT", "BONUS"],
    },
    quantite: { type: Number, required: true },
    soldeApres: { type: Number, required: true },
    motif: { type: String, required: true },
  },
  { timestamps: { createdAt: "creeLe", updatedAt: false } }
);

export const CreditMouvementModel =
  mongoose.models.CreditMouvement ||
  mongoose.model<ICreditMouvementDocument>("CreditMouvement", CreditMouvementSchema);
