/**
 * Module A - JournalAudit Model
 * Audit log for all important actions
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

export interface IJournalAudit extends Document {
  _id: mongoose.Types.ObjectId;
  utilisateurId?: Types.ObjectId;
  action: string;
  entite: string;
  entiteId: string;
  details?: Record<string, any>;
  ip?: string;
  creeLe: Date;
}

const JournalAuditSchema = new Schema<IJournalAudit>(
  {
    utilisateurId: {
      type: Schema.Types.ObjectId,
      ref: 'Utilisateur',
      // Optional: system actions may not have a user
    },
    action: {
      type: String,
      required: true,
      trim: true,
      // Ex: "FOURNISSEUR_VALIDE", "PRODUIT_PUBLIE"
    },
    entite: {
      type: String,
      required: true,
      trim: true,
      // Ex: "Fournisseur", "Produit"
    },
    entiteId: {
      type: String,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      // JSON pour infos supplémentaires
    },
    ip: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: 'creeLe',
      updatedAt: false, // Audit logs are immutable
    },
  }
);

// Indexes
JournalAuditSchema.index({ utilisateurId: 1 });
JournalAuditSchema.index({ action: 1 });
JournalAuditSchema.index({ entite: 1, entiteId: 1 });
JournalAuditSchema.index({ creeLe: -1 });

export const JournalAudit =
  models.JournalAudit || model<IJournalAudit>('JournalAudit', JournalAuditSchema);

export default JournalAudit;
