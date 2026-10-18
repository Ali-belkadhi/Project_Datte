/**
 * Module A - Message Model
 * Individual messages within conversations
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';

export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: Types.ObjectId;
  expediteurId: Types.ObjectId;
  contenu: string;
  lu: boolean;
  creeLe: Date;
  modifieLe: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    expediteurId: {
      type: Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
    },
    contenu: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    lu: {
      type: Boolean,
      default: false,
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
MessageSchema.index({ conversationId: 1, creeLe: 1 });
MessageSchema.index({ expediteurId: 1 });

export const Message = models.Message || model<IMessage>('Message', MessageSchema);

export default Message;
