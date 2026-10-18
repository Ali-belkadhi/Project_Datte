/**
 * Module A - Notification Model
 * In-app, email, and push notifications
 */

import mongoose, { Schema, model, models, Document, Types } from 'mongoose';
import { TypeNotification } from '../enums';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  utilisateurId: Types.ObjectId;
  type: TypeNotification;
  titre: string;
  contenu: string;
  lien?: string;
  lue: boolean;
  creeLe: Date;
  modifieLe: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    utilisateurId: {
      type: Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TypeNotification),
      required: true,
    },
    titre: {
      type: String,
      required: true,
      trim: true,
    },
    contenu: {
      type: String,
      required: true,
      trim: true,
    },
    lien: {
      type: String,
      // Route interne ex: /commande/123
    },
    lue: {
      type: Boolean,
      default: false,
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
NotificationSchema.index({ utilisateurId: 1, lue: 1 });
NotificationSchema.index({ utilisateurId: 1, creeLe: -1 });
NotificationSchema.index({ type: 1 });

// Method to mark as read
NotificationSchema.methods.marquerLue = function () {
  this.lue = true;
  return this.save();
};

export const Notification =
  models.Notification || model<INotification>('Notification', NotificationSchema);

export default Notification;
