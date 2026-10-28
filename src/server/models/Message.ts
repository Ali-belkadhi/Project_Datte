import { Schema, model, models, type Document, type Model } from "mongoose";

export interface IMessage {
  _id?: unknown;
  conversationId: unknown;
  expediteurId: unknown;
  contenu: string;
  lu: boolean;
  creeLe?: Date;
}

export type MessageDocument = IMessage & Document;

const SchemaMsg = new Schema<MessageDocument>(
  {
    conversationId: { type: Schema.Types.ObjectId, required: true, ref: "Conversation", index: true },
    expediteurId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    contenu: { type: String, required: true, maxlength: 2000 },
    lu: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "creeLe", updatedAt: false } },
);

SchemaMsg.index({ conversationId: 1, creeLe: -1 });

export const Message: Model<MessageDocument> =
  (models.Message as Model<MessageDocument>) || model<MessageDocument>("Message", SchemaMsg);