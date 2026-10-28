import { Schema, model, models, type Document, type Model } from "mongoose";

export interface IJournalAudit {
  _id?: unknown;
  action: string;
  entite: string;
  entiteId: string;
  details?: Record<string, unknown>;
  ip?: string;
  utilisateurId?: unknown;
  creeLe?: Date;
}

export type JournalAuditDocument = IJournalAudit & Document;

const SchemaAudit = new Schema<JournalAuditDocument>(
  {
    action: { type: String, required: true },
    entite: { type: String, required: true },
    entiteId: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    ip: { type: String },
    utilisateurId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: "creeLe", updatedAt: false } },
);

SchemaAudit.index({ entite: 1, entiteId: 1, creeLe: -1 });

export const JournalAudit: Model<JournalAuditDocument> =
  (models.JournalAudit as Model<JournalAuditDocument>) || model<JournalAuditDocument>("JournalAudit", SchemaAudit);