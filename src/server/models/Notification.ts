import { Schema, model, models, type Document, type Model } from "mongoose";

export type TypeNotification =
  | "COMMANDE_STATUT"
  | "NOUVELLE_COMMANDE"
  | "MODELE_3D_PRET"
  | "MODELE_3D_ECHEC"
  | "NOUVEAU_MESSAGE"
  | "STOCK_BAS"
  | "NOUVEL_AVIS"
  | "FOURNISSEUR_VALIDE"
  | "FOURNISSEUR_REFUSE"
  | "FOURNISSEUR_SUSPENDU"
  | "NOUVELLE_DEMANDE_FOURNISSEUR"
  | "ANALYSE_IA_PRETE"
  | "LITIGE"
  | "CREDITS_3D_BAS"
  | "ACHAT_CREDITS_CONFIRME";

export interface INotification {
  _id?: unknown;
  userId: unknown;
  type: TypeNotification;
  titre: string;
  contenu: string;
  lien?: string;
  lue: boolean;
  donnees?: Record<string, unknown>;
  creeLe?: Date;
}

export type NotificationDocument = INotification & Document;

const SchemaNotif = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    type: { type: String, required: true },
    titre: { type: String, required: true },
    contenu: { type: String, required: true },
    lien: { type: String },
    lue: { type: Boolean, default: false },
    donnees: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: "creeLe", updatedAt: false } },
);

SchemaNotif.index({ userId: 1, lue: 1, creeLe: -1 });
// TTL cleanup of read notifications older than 90 days
SchemaNotif.index({ creeLe: 1 }, { expireAfterSeconds: 90 * 24 * 3600, partialFilterExpression: { lue: true } });

export const Notification: Model<NotificationDocument> =
  (models.Notification as Model<NotificationDocument>) || model<NotificationDocument>("Notification", SchemaNotif);