import { Schema, model, models, type Document, type Model } from "mongoose";

export type OtpPurpose = "VERIFY_EMAIL" | "RESET_PASSWORD" | "VERIFY_PHONE_CHANGE";

export interface IOtp {
  _id?: unknown;
  email?: string;
  userId?: unknown;
  purpose: OtpPurpose;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
  consumedAt?: Date;
  createdAt?: Date;
}

export type OtpDocument = IOtp & Document;

const OtpSchema = new Schema<OtpDocument>(
  {
    email: { type: String, lowercase: true, trim: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    purpose: { type: String, enum: ["VERIFY_EMAIL", "RESET_PASSWORD", "VERIFY_PHONE_CHANGE"], required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// TTL index: Mongo removes documents after expiresAt
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp: Model<OtpDocument> = (models.Otp as Model<OtpDocument>) || model<OtpDocument>("Otp", OtpSchema);