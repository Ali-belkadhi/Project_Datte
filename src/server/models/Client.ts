import { Schema, model, models, type Document, type Model } from "mongoose";

export interface IClient {
  _id?: unknown;
  userId: unknown;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ClientDocument = IClient & Document;

const ClientSchema = new Schema<ClientDocument>(
  { userId: { type: Schema.Types.ObjectId, required: true, ref: "User", unique: true } },
  { timestamps: true },
);

export const Client: Model<ClientDocument> =
  (models.Client as Model<ClientDocument>) || model<ClientDocument>("Client", ClientSchema);