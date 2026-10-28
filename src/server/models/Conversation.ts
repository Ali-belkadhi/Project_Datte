import { Schema, model, models, type Document, type Model } from "mongoose";

export interface IConversation {
  _id?: unknown;
  clientId: unknown;
  fournisseurId: unknown;
  produitId?: unknown;
  sousCommandeId?: unknown;
  dernierMessageLe?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ConversationDocument = IConversation & Document;

const SchemaConv = new Schema<ConversationDocument>(
  {
    clientId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    fournisseurId: { type: Schema.Types.ObjectId, required: true, ref: "Fournisseur", index: true },
    produitId: { type: Schema.Types.ObjectId, index: true },
    sousCommandeId: { type: Schema.Types.ObjectId, index: true },
    dernierMessageLe: { type: Date },
  },
  { timestamps: true },
);

SchemaConv.index({ clientId: 1, fournisseurId: 1, produitId: 1, sousCommandeId: 1 }, { unique: true });

export const Conversation: Model<ConversationDocument> =
  (models.Conversation as Model<ConversationDocument>) || model<ConversationDocument>("Conversation", SchemaConv);