import { Schema, model, models, type Document, type Model } from "mongoose";

export type CibleSignalement = "PRODUIT" | "AVIS" | "FOURNISSEUR" | "MESSAGE";
export type StatutSignalement = "OUVERT" | "TRAITE" | "REJETE";
export type MotifSignalement = "INAPPROPRIE" | "FRAUDE" | "SPAM" | "NON_CONFORME" | "AUTRE";

export interface ISignalement {
  _id?: unknown;
  auteurId: unknown;
  cibleType: CibleSignalement;
  cibleId: string;
  cibleLibelle?: string;
  motif: MotifSignalement;
  texteLibre?: string;
  statut: StatutSignalement;
  traiteParId?: unknown;
  noteAdmin?: string;
  creeLe?: Date;
  updatedAt?: Date;
}

export type SignalementDocument = ISignalement & Document;

const SchemaSig = new Schema<SignalementDocument>(
  {
    auteurId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    cibleType: { type: String, enum: ["PRODUIT", "AVIS", "FOURNISSEUR", "MESSAGE"], required: true },
    cibleId: { type: String, required: true },
    cibleLibelle: { type: String, maxlength: 200 },
    motif: { type: String, enum: ["INAPPROPRIE", "FRAUDE", "SPAM", "NON_CONFORME", "AUTRE"], required: true },
    texteLibre: { type: String, maxlength: 500 },
    statut: { type: String, enum: ["OUVERT", "TRAITE", "REJETE"], default: "OUVERT" },
    traiteParId: { type: Schema.Types.ObjectId, ref: "User" },
    noteAdmin: { type: String, maxlength: 500 },
  },
  { timestamps: { createdAt: "creeLe", updatedAt: true } },
);

SchemaSig.index({ auteurId: 1, cibleType: 1, cibleId: 1 }, { unique: true });
SchemaSig.index({ creeLe: -1 });
SchemaSig.index({ statut: 1, cibleType: 1 });

export const Signalement: Model<SignalementDocument> =
  (models.Signalement as Model<SignalementDocument>) || model<SignalementDocument>("Signalement", SchemaSig);