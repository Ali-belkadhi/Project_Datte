import { Schema, model, models, type Document, type Model } from "mongoose";

export type TypeFournisseur = "PRODUCTEUR" | "COOPERATIVE" | "REVENDEUR" | "TRANSFORMATEUR";
export type StatutVerification = "EN_ATTENTE" | "VERIFIE" | "REFUSE" | "SUSPENDU";
export type Gouvernorat = string;

export interface IFournisseur {
  _id?: unknown;
  userId: unknown;
  nomBoutique?: string;
  slug?: string;
  type?: TypeFournisseur;
  region?: string;
  adresseExploitation?: string;
  description?: string;
  couleur?: string;
  delaiExpedition?: string;
  varietes?: string[];
  matriculeFiscal?: string;
  numeroRNE?: string;
  ribEncrypted?: { iv: string; tag: string; data: string; last4: string } | null;
  logoUrl?: string;
  bannerUrl?: string;
  noteMoyenne?: number;
  nombreAvis?: number;
  nombreVentes?: number;
  statutVerification: StatutVerification;
  motifRefus?: string;
  soumisLe?: Date;
  verifieLe?: Date;
  analyseIALe?: Date;
  onboardingStep?: number;
  onboardingComplete?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FournisseurDocument = IFournisseur & Document;

const FournisseurSchema = new Schema<FournisseurDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", unique: true },
    nomBoutique: { type: String, trim: true },
    slug: { type: String, trim: true, unique: true, sparse: true },
    type: { type: String, enum: ["PRODUCTEUR", "COOPERATIVE", "REVENDEUR", "TRANSFORMATEUR"] },
    region: { type: String },
    adresseExploitation: { type: String },
    description: { type: String, maxlength: 1000 },
    couleur: { type: String, enum: ["amber", "date", "palm", "clay", "night"] },
    delaiExpedition: { type: String, maxlength: 60 },
    varietes: { type: [String], default: [] },
    matriculeFiscal: { type: String },
    numeroRNE: { type: String },
    ribEncrypted: {
      iv: { type: String },
      tag: { type: String },
      data: { type: String },
      last4: { type: String },
    },
    logoUrl: { type: String },
    bannerUrl: { type: String },
    noteMoyenne: { type: Number, default: 0, min: 0, max: 5 },
    nombreAvis: { type: Number, default: 0, min: 0 },
    nombreVentes: { type: Number, default: 0, min: 0 },
    statutVerification: { type: String, enum: ["EN_ATTENTE", "VERIFIE", "REFUSE", "SUSPENDU"], default: "EN_ATTENTE" },
    motifRefus: { type: String },
    soumisLe: { type: Date },
    verifieLe: { type: Date },
    analyseIALe: { type: Date },
    onboardingStep: { type: Number, default: 0 },
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true },
);

FournisseurSchema.index({ statutVerification: 1, createdAt: -1 });

export const Fournisseur: Model<FournisseurDocument> =
  (models.Fournisseur as Model<FournisseurDocument>) || model<FournisseurDocument>("Fournisseur", FournisseurSchema);