import mongoose, { Schema, Document } from "mongoose";

export interface IModele3DDocument extends Document {
  modelId: string;
  fournisseurId: string;
  produitId: string;
  produitNom: string;
  source: object | null;
  visuel: string;
  variete?: string;
  statut: "EN_ATTENTE" | "EN_COURS" | "PRET" | "PUBLIE" | "REJETE" | "ECHEC";
  progression: number;
  creditsConsommes: number;
  polycount?: number;
  glbUrl?: string;
  usdzUrl?: string;
  taskId?: string;
  creeLe: Date;
  misAJourLe: Date;
}

const Modele3DSchema = new Schema<IModele3DDocument>(
  {
    modelId: { type: String, required: true, unique: true, index: true },
    fournisseurId: { type: String, required: true, index: true },
    produitId: { type: String, required: true, index: true },
    produitNom: { type: String, required: true },
    source: { type: Schema.Types.Mixed, default: null },
    visuel: { type: String, default: "vrac" },
    variete: { type: String },
    statut: {
      type: String,
      required: true,
      enum: ["EN_ATTENTE", "EN_COURS", "PRET", "PUBLIE", "REJETE", "ECHEC"],
      default: "EN_ATTENTE",
    },
    progression: { type: Number, default: 0 },
    creditsConsommes: { type: Number, default: 1 },
    polycount: { type: Number },
    glbUrl: { type: String },
    usdzUrl: { type: String },
    taskId: { type: String, index: true },
  },
  { timestamps: { createdAt: "creeLe", updatedAt: "misAJourLe" } }
);

export const Modele3DModel =
  mongoose.models.Modele3D || mongoose.model<IModele3DDocument>("Modele3D", Modele3DSchema);
