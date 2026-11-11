import { Schema, model, models, type Document, type Model } from "mongoose";

export type Role = "CLIENT" | "FOURNISSEUR" | "ADMIN";
export type Langue = "FR" | "AR" | "EN";
export type StatutCompte = "ACTIF" | "SUSPENDU" | "SUPPRIME";

export interface IUser {
  _id?: unknown;
  email: string;
  motDePasseHash: string | null;
  nom: string;
  prenom: string;
  telephone?: string;
  telephoneVerifie?: boolean;
  avatarUrl?: string;
  role: Role;
  langue: Langue;
  emailVerifie: boolean;
  statut: StatutCompte;
  derniereConnexion?: Date;
  tokenVersion: number;
  notificationsPrefs?: Record<string, boolean>;
  motDePasseModifieLe?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDocument = IUser & Document;

const UserSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    motDePasseHash: { type: String, default: null },
    nom: { type: String, trim: true, default: "" },
    prenom: { type: String, trim: true, default: "" },
    telephone: { type: String, unique: true, sparse: true, trim: true },
    telephoneVerifie: { type: Boolean, default: false },
    avatarUrl: { type: String },
    role: { type: String, enum: ["CLIENT", "FOURNISSEUR", "ADMIN"], required: true, default: "CLIENT" },
    langue: { type: String, enum: ["FR", "AR", "EN"], default: "FR" },
    emailVerifie: { type: Boolean, default: false },
    statut: { type: String, enum: ["ACTIF", "SUSPENDU", "SUPPRIME"], default: "ACTIF" },
    derniereConnexion: { type: Date },
    tokenVersion: { type: Number, default: 0 },
    notificationsPrefs: { type: Schema.Types.Mixed, default: {} },
    motDePasseModifieLe: { type: Date },
  },
  { timestamps: true },
);

export const User: Model<UserDocument> = (models.User as Model<UserDocument>) || model<UserDocument>("User", UserSchema);