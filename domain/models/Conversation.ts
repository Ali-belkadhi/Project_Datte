/**
 * Module A - Conversation Model
 * Messaging between client and fournisseur
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  clientId: Types.ObjectId;
  fournisseurId: Types.ObjectId;
  produitId?: Types.ObjectId;
  sousCommandeId?: Types.ObjectId;
  dernierMessageLe: Date;
  creeLe: Date;
  modifieLe: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
      index: true,
    },
    fournisseurId: {
      type: Schema.Types.ObjectId,
      ref: 'Fournisseur',
      required: true,
      index: true,
    },
    produitId: {
      type: Schema.Types.ObjectId,
      ref: 'Produit',
    },
    sousCommandeId: {
      type: Schema.Types.ObjectId,
      ref: 'SousCommande',
    },
    dernierMessageLe: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: {
      createdAt: 'creeLe',
      updatedAt: 'modifieLe',
    },
  }
);

// Indexes
ConversationSchema.index({ clientId: 1, fournisseurId: 1 });
ConversationSchema.index({ dernierMessageLe: -1 });

export const Conversation =
  models.Conversation || model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
